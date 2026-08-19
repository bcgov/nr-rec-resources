/**
 * Backfill parent_id on rst.recreation_asset rows that were migrated from
 * fta.recreation_structure but are missing their parent_id.
 *
 * A structure asset needs a parent_id when the source structure had a
 * campsite_number — meaning it belongs to a defined campsite asset
 * (asset_code = 227, asset_tag = "CS-###").
 *
 * This script:
 *   1. Reads all structure assets that have legacy_structure_id set and
 *      parent_id IS NULL.
 *   2. For each, looks up the source campsite_number from
 *      fta.recreation_structure via legacy_structure_id.
 *   3. Finds the matching campsite asset in rst.recreation_asset by
 *      (rec_resource_id, asset_code=227, asset_tag="CS-###").
 *   4. UPDATEs parent_id on the structure asset row(s).
 *
 * Safe to re-run — only touches rows where parent_id IS NULL.
 *
 * Usage:
 *   npx tsx ops/src/assets/backfill-parent-id.ts [--dry-run]
 *
 * Environment variables:
 *   DATABASE_URL  - RST PostgreSQL connection string (required)
 *   FTA_DB_URL    - FTA PostgreSQL connection string (required; may be same db)
 *   LOG_LEVEL     - Winston log level (default: info)
 */

import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

const SYNC_SOURCE = 'backfill-parent-id';
const CAMPSITE_ASSET_CODE = 227;

async function main(): Promise<void> {
  const logger = createLogger(SYNC_SOURCE);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL is required');
    process.exit(1);
  }
  const ftaDbUrl = process.env.FTA_DB_URL;
  if (!ftaDbUrl) {
    logger.error('FTA_DB_URL is required');
    process.exit(1);
  }

  const argv = await yargs(hideBin(process.argv))
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Show what would be updated without writing anything',
    })
    .option('batch-size', {
      type: 'number',
      default: 500,
      description: 'Number of asset rows to process per batch',
    })
    .help()
    .parseAsync();

  const dryRun = argv['dry-run'] as boolean;
  const batchSize = argv['batch-size'] as number;

  const rstPool = new Pool({ connectionString: databaseUrl });
  const ftaPool = new Pool({ connectionString: ftaDbUrl });

  try {
    logger.info('Starting parent_id backfill', { dryRun: String(dryRun) });

    // -----------------------------------------------------------------------
    // Step 1: fetch all structure assets that are missing a parent_id but
    //         have a legacy_structure_id (i.e. came from fta.recreation_structure)
    // -----------------------------------------------------------------------
    const { rows: candidates } = await rstPool.query<{
      asset_id: string;
      rec_resource_id: string;
      legacy_structure_id: string;
    }>(`
      SELECT asset_id, rec_resource_id, legacy_structure_id
      FROM rst.recreation_asset
      WHERE parent_id IS NULL
        AND legacy_structure_id IS NOT NULL
        AND asset_code IS NOT NULL
        AND asset_code != $1
      ORDER BY legacy_structure_id, asset_id
    `, [CAMPSITE_ASSET_CODE]);

    logger.info('Found structure assets with missing parent_id', {
      count: String(candidates.length),
    });

    if (candidates.length === 0) {
      logger.info('Nothing to backfill — all done.');
      return;
    }

    // -----------------------------------------------------------------------
    // Step 2: fetch campsite_number for each legacy_structure_id from FTA.
    //         legacy_structure_id = structure_id (cast to varchar) for
    //         structures, so we can query directly.
    //         Some assets may be fan-out duplicates of the same structure
    //         (structure_count > 1) — group by legacy_structure_id.
    // -----------------------------------------------------------------------
    const legacyIds = [...new Set(candidates.map(r => r.legacy_structure_id))];

    logger.info('Fetching campsite_number from FTA for unique legacy_structure_ids', {
      count: String(legacyIds.length),
    });

    // Fetch in batches to avoid huge IN lists
    const FETCH_CHUNK = 1000;
    const campsitenumberByLegacyId = new Map<string, number>(); // legacy_structure_id -> campsite_number

    for (let i = 0; i < legacyIds.length; i += FETCH_CHUNK) {
      const chunk = legacyIds.slice(i, i + FETCH_CHUNK);
      const { rows } = await ftaPool.query<{
        structure_id: string;
        campsite_number: string | null;
        forest_file_id: string;
        campsite_forest_file_id: string | null;
      }>(
        `SELECT structure_id::text, campsite_number, forest_file_id, campsite_forest_file_id
         FROM fta.recreation_structure
         WHERE structure_id::text = ANY($1)
           AND campsite_number IS NOT NULL`,
        [chunk],
      );
      for (const row of rows) {
        if (row.campsite_number !== null) {
          campsitenumberByLegacyId.set(row.structure_id, Number(row.campsite_number));
        }
      }
    }

    // Also need forest_file_id for the campsite lookup
    const forestFileByLegacyId = new Map<string, { forestFileId: string; campsiteForestFileId: string | null }>();
    for (let i = 0; i < legacyIds.length; i += FETCH_CHUNK) {
      const chunk = legacyIds.slice(i, i + FETCH_CHUNK);
      const { rows } = await ftaPool.query<{
        structure_id: string;
        forest_file_id: string;
        campsite_forest_file_id: string | null;
      }>(
        `SELECT structure_id::text, forest_file_id, campsite_forest_file_id
         FROM fta.recreation_structure
         WHERE structure_id::text = ANY($1)`,
        [chunk],
      );
      for (const row of rows) {
        forestFileByLegacyId.set(row.structure_id, {
          forestFileId: row.forest_file_id,
          campsiteForestFileId: row.campsite_forest_file_id,
        });
      }
    }

    const withCampsite = candidates.filter(c => campsitenumberByLegacyId.has(c.legacy_structure_id));
    logger.info('Structure assets with a campsite_number to resolve', {
      count: String(withCampsite.length),
      no_campsite_number: String(candidates.length - withCampsite.length),
    });

    if (withCampsite.length === 0) {
      logger.info('No structures have a campsite_number — nothing to backfill.');
      return;
    }

    // -----------------------------------------------------------------------
    // Step 3: for each candidate, look up the campsite asset_id from RST
    //         using (rec_resource_id, asset_code=227, asset_tag="CS-###")
    // -----------------------------------------------------------------------

    // Build a unique set of (rec_resource_id, asset_tag) lookups needed
    const campsiteAssetIdMap = new Map<string, bigint>(); // "rec_resource_id|CS-###" -> asset_id

    const lookupPairs = new Set<string>();
    for (const c of withCampsite) {
      const campsiteNum = campsitenumberByLegacyId.get(c.legacy_structure_id)!;
      const assetTag = `CS-${String(campsiteNum).padStart(3, '0')}`;
      lookupPairs.add(`${c.rec_resource_id}|${assetTag}`);
    }

    const pairArray = [...lookupPairs].map(p => {
      const [rid, tag] = p.split('|');
      return { rec_resource_id: rid, asset_tag: tag };
    });

    logger.info('Looking up campsite asset_ids', { pairs: String(pairArray.length) });

    for (let i = 0; i < pairArray.length; i += FETCH_CHUNK) {
      const chunk = pairArray.slice(i, i + FETCH_CHUNK);
      const recIds = chunk.map(p => p.rec_resource_id);
      const tags = chunk.map(p => p.asset_tag);

      const { rows } = await rstPool.query<{
        asset_id: string;
        rec_resource_id: string;
        asset_tag: string;
      }>(
        `SELECT asset_id, rec_resource_id, asset_tag
         FROM rst.recreation_asset
         WHERE asset_code = $1
           AND rec_resource_id = ANY($2)
           AND asset_tag = ANY($3)`,
        [CAMPSITE_ASSET_CODE, recIds, tags],
      );

      for (const row of rows) {
        campsiteAssetIdMap.set(`${row.rec_resource_id}|${row.asset_tag}`, BigInt(row.asset_id));
      }
    }

    // -----------------------------------------------------------------------
    // Step 4: batch UPDATE parent_id
    // Disable triggers on recreation_asset to avoid the history trigger
    // firing for every row — we are only setting parent_id so there is
    // nothing meaningful to audit here. Re-enabled in the finally block.
    // -----------------------------------------------------------------------
    let updated = 0;
    let notFound = 0;

    if (!dryRun) {
      await rstPool.query('ALTER TABLE rst.recreation_asset DISABLE TRIGGER USER');
      logger.info('Triggers disabled on rst.recreation_asset');
    }

    try {
      for (let i = 0; i < withCampsite.length; i += batchSize) {
      const batch = withCampsite.slice(i, i + batchSize);

      // Build update pairs: [asset_id, parent_id]
      const updatePairs: Array<{ assetId: string; parentId: bigint }> = [];

      for (const c of batch) {
        const campsiteNum = campsitenumberByLegacyId.get(c.legacy_structure_id)!;
        const assetTag = `CS-${String(campsiteNum).padStart(3, '0')}`;
        const mapKey = `${c.rec_resource_id}|${assetTag}`;
        const parentId = campsiteAssetIdMap.get(mapKey);

        if (!parentId) {
          logger.warn('Campsite asset not found — parent_id cannot be set', {
            asset_id: c.asset_id,
            rec_resource_id: c.rec_resource_id,
            legacy_structure_id: c.legacy_structure_id,
            campsite_number: String(campsiteNum),
          });
          notFound++;
          continue;
        }

        updatePairs.push({ assetId: c.asset_id, parentId });
      }

      if (updatePairs.length === 0) continue;

      if (dryRun) {
        for (const p of updatePairs) {
          logger.debug('Dry run: would set parent_id', {
            asset_id: p.assetId,
            parent_id: p.parentId.toString(),
          });
        }
        updated += updatePairs.length;
        continue;
      }

      // Use UPDATE ... FROM (VALUES ...) for a single round-trip per batch
      const valueList = updatePairs
        .map((_, idx) => `($${idx * 2 + 1}::bigint, $${idx * 2 + 2}::bigint)`)
        .join(', ');
      const params = updatePairs.flatMap(p => [p.assetId, p.parentId.toString()]);

      await rstPool.query(
        `UPDATE rst.recreation_asset AS a
         SET parent_id = v.parent_id
         FROM (VALUES ${valueList}) AS v(asset_id, parent_id)
         WHERE a.asset_id = v.asset_id`,
        params,
      );

      updated += updatePairs.length;
      logger.info(
        `Updated batch ${Math.floor(i / batchSize) + 1}` +
          ` (${Math.min(i + batchSize, withCampsite.length)}/${withCampsite.length})`,
      );
    }
    } finally {
      if (!dryRun) {
        await rstPool.query('ALTER TABLE rst.recreation_asset ENABLE TRIGGER USER');
        logger.info('Triggers re-enabled on rst.recreation_asset');
      }
    }

    logger.info('parent_id backfill complete', {
      updated: String(updated),
      not_found: String(notFound),
      dryRun: String(dryRun),
    });
  } catch (err) {
    logger.error('Fatal error', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  } finally {
    await rstPool.end();
    await ftaPool.end();
  }
}

main();


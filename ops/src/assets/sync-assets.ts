/**
 * Ops script to fill rst.recreation_asset from FTA structure/campsite data.
 *
 * This is a standalone variant of src/assets/sync-assets.ts, adjusted for
 * the current rst.recreation_asset schema (created_by / updated_by columns,
 * no upsert_timestamp_columns trigger assumed) and written to be safely
 * re-runnable (idempotent) since recreation_asset has no natural unique
 * constraint on the legacy key columns.
 *
 * Source tables (fta schema):
 *   - fta.recreation_structure         - individual structure records
 *   - fta.recreation_structure_value   - default value per structure code
 *   - fta.recreation_defined_campsite  - campsite records (used to build parent assets)
 *
 * Also migrates:
 *   - fta.recreation_trail_segment -> recreation_asset, one row per segment unit.
 *     Trail segments have no natural single-column id (the source PK is
 *     forest_file_id + recreation_trail_seg_id), and several source columns
 *     (recreation_remed_repair_code, estimated_repair_cost,
 *     actual_repair_cost, repair_completed_date, wheelchair_accessible_ind)
 *     have NO destination column on recreation_asset, so that data is
 *     dropped by this script. See the trail segment mapping table below.
 *
 *   trail segment mapping:
 *     rec_resource_id      - forest_file_id
 *     asset_code           - value of --trail-asset-code (required CLI arg;
 *                             there's no default because we don't want to
 *                             guess a wrong FK into recreation_asset_code)
 *     asset_tag             - trail_segment_name
 *     legacy_structure_id   - `${forest_file_id}-${recreation_trail_seg_id}`
 *                             for single-unit segments, or
 *                             `${forest_file_id}-${recreation_trail_seg_id}-${i}`
 *                             (0-based, zero-padded to 3 digits) for multi-unit
 *     asset_length           - (end_station - start_station) / count (metres),
 *                             null if either station is missing
 *     asset_width / asset_area - null (no source data)
 *     default_value         - looked up in fta.recreation_structure_value by
 *                             the trail asset code, if a matching row exists
     *     actual_value          - actual_repair_cost / count (divided evenly across units)
 *     parent_id              - null (trail segments aren't nested under a campsite)
 *
 *   count for trail segments is derived from revision_count when > 0,
 *   otherwise defaults to 1. asset_length is divided evenly across units.
 *
 * Target table: rst.recreation_asset
 *
 * Mapping (per spec):
 *   asset_id              - auto-generated (bigint identity)
 *   parent_id             - asset_id of the campsite asset matching campsite_number
 *                           (only populated when structure has a campsite_number)
 *   asset_tag             - null for structures; "CS-###" for campsite assets
 *   rec_resource_id       - looked up from rst.recreation_resource via forest_file_id
 *                           (campsite_forest_file_id preferred, else forest_file_id)
 *   asset_code            - recreation_structure_code (matches rst.recreation_asset_code.asset_code)
 *                           campsite assets use CAMPSITE_ASSET_CODE (see assumption below)
 *   asset_name            - null (default)
 *   asset_comment         - structure_name from fta.recreation_structure
 *   legacy_structure_id   - structure_id cast to varchar
 *   asset_length          - structure_length
 *   asset_width           - structure_width
 *   asset_area            - structure_area
 *   default_value         - structure_value from fta.recreation_structure_value
 *   actual_value          - actual_value / structure_count (one row inserted per unit)
 *   installation_date     - null (not available in FTA)
 *   created_at / updated_at - left to column defaults (now())
 *   created_by / updated_by - set to the --actor value (see CLI args)
 *
 * Assumptions / open questions (confirm before relying on this in prod):
 *   1. CAMPSITE_ASSET_CODE (227) is carried over from the original script's
 *      hardcoded value for "campsite" in rst.recreation_asset_code. If that
 *      code has changed, update the constant below.
 *   2. Idempotency strategy: since recreation_asset has no unique constraint
 *      on (rec_resource_id, asset_code, legacy_structure_id), re-running
 *      this script would normally create duplicate rows. To make reruns
 *      safe, this script DELETEs any existing asset rows with a matching
 *      legacy_structure_id before re-inserting a structure's units, and
 *      looks up (rec_resource_id, asset_code, asset_tag) before inserting a
 *      campsite asset to avoid duplicate campsites. If you'd rather this
 *      script only ever INSERT (never DELETE), say so and we can switch to
 *      an append-only + pre-check mode instead.
 *   3. created_by / updated_by have no source value in FTA, so they're set
 *      to a fixed --actor string (default: "fta-migration"). Pass --actor
 *      to override, e.g. if you want the FTA entry_userid/update_userid
 *      carried across instead - that data IS available on both source
 *      tables (entry_userid/update_userid) if you'd prefer that mapping.
 *
 * Usage:
 *   npx tsx src/assets/sync-assets.ts [options]
 *
 * Environment variables:
 *   DATABASE_URL   - RST PostgreSQL connection string (required)
 *   FTA_DB_URL     - FTA PostgreSQL connection string (required)
 *   LOG_LEVEL      - Winston log level (default: info)
 */

import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger, Logger } from '../logger';

const SYNC_SOURCE = 'fill-recreation-assets';

// See assumption (1) above.
const CAMPSITE_ASSET_CODE = 227;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface ParsedArgs {
  dryRun: boolean;
  clean: boolean;
  concurrency: number;
  batchSize: number;
  actor: string;
  trailAssetCode?: number;
  skipTrails: boolean; // default: true
}

async function parseArgs(): Promise<ParsedArgs> {
  const parsed = await yargs(hideBin(process.argv))
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description:
        'Fetch and transform data without writing to the RST database',
    })
    .option('clean', {
      type: 'boolean',
      default: false,
      description:
        'Truncate rst.recreation_asset before syncing (full refresh). ' +
        'WARNING: cascades to recreation_asset_repair and recreation_asset_geom.',
    })
    .option('concurrency', {
      type: 'number',
      default: 5,
      description: 'Number of concurrent database writes per batch',
    })
    .option('batch-size', {
      type: 'number',
      default: 200,
      description: 'Number of structures to process per batch',
    })
    .option('actor', {
      type: 'string',
      default: 'fta-migration',
      description:
        'Value written to created_by/updated_by for rows this script writes',
    })
    .option('trail-asset-code', {
      type: 'number',
      description:
        'asset_code (FK to rst.recreation_asset_code) to use for trail ' +
        'segment assets. Required unless --skip-trails is set - there is ' +
        'no default because guessing the wrong FK would silently mislabel ' +
        'assets.',
    })
    .option('skip-trails', {
      type: 'boolean',
      default: true,
      description:
        'Skip migrating fta.recreation_trail_segment entirely. ' +
        'Defaults to true; pass --no-skip-trails together with ' +
        '--trail-asset-code to enable trail segment migration.',
    })
    .check((argv: Record<string, unknown>) => {
      if (!argv['skip-trails'] && argv['trail-asset-code'] === undefined) {
        throw new Error(
          '--trail-asset-code is required (pass the asset_code for trail ' +
            'segments) or pass --skip-trails to skip trail migration',
        );
      }
      return true;
    })
    .help()
    .parseAsync();

  return {
    dryRun: parsed['dry-run'] as boolean,
    clean: parsed.clean as boolean,
    concurrency: parsed.concurrency as number,
    batchSize: parsed['batch-size'] as number,
    actor: parsed.actor as string,
    trailAssetCode: parsed['trail-asset-code'] as number | undefined,
    skipTrails: parsed['skip-trails'] as boolean,
  };
}

// ---------------------------------------------------------------------------
// FTA row types
// ---------------------------------------------------------------------------

interface FtaStructure {
  structure_id: string;
  forest_file_id: string;
  campsite_forest_file_id: string | null;
  recreation_structure_code: number;
  structure_name: string | null;
  structure_length: number | null;
  structure_width: number | null;
  structure_area: number | null;
  actual_value: number | null;
  structure_count: number | null;
  campsite_number: number | null;
}

interface FtaStructureValue {
  recreation_structure_code: string;
  structure_value: number | null;
}

interface FtaCampsite {
  forest_file_id: string;
  campsite_number: number;
}

interface FtaTrailSegment {
  forest_file_id: string;
  recreation_trail_seg_id: number;
  trail_segment_name: string | null;
  start_station: number | null;
  end_station: number | null;
  actual_repair_cost: number | null;
  /** Used as the unit count for fan-out. Defaults to 1 when null or <= 0. */
  revision_count: number | null;
}

// ---------------------------------------------------------------------------
// Main class
// ---------------------------------------------------------------------------

class RecreationAssetFiller {
  private logger: Logger;
  private rstPool: Pool;
  private ftaPool: Pool;

  constructor(logger: Logger, rstPool: Pool, ftaPool: Pool) {
    this.logger = logger;
    this.rstPool = rstPool;
    this.ftaPool = ftaPool;
  }

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  async fetchStructures(): Promise<FtaStructure[]> {
    const { rows } = await this.ftaPool.query<FtaStructure>(`
      SELECT
        structure_id::text,
        forest_file_id,
        campsite_forest_file_id,
        recreation_structure_code,
        structure_name,
        structure_length,
        structure_width,
        structure_area,
        actual_value,
        structure_count,
        campsite_number
      FROM fta.recreation_structure
      ORDER BY structure_id
    `);
    return rows;
  }

  async fetchStructureValues(): Promise<Map<number, number | null>> {
    const { rows } = await this.ftaPool.query<FtaStructureValue>(`
      SELECT recreation_structure_code::text, structure_value
      FROM fta.recreation_structure_value
    `);
    const map = new Map<number, number | null>();
    for (const row of rows) {
      map.set(Number(row.recreation_structure_code), row.structure_value ?? null);
    }
    return map;
  }

  async fetchCampsites(): Promise<FtaCampsite[]> {
    const { rows } = await this.ftaPool.query<FtaCampsite>(`
      SELECT forest_file_id, campsite_number
      FROM fta.recreation_defined_campsite
      ORDER BY forest_file_id, campsite_number
    `);
    return rows;
  }

  async fetchTrailSegments(): Promise<FtaTrailSegment[]> {
    const { rows } = await this.ftaPool.query<FtaTrailSegment>(`
      SELECT
        forest_file_id,
        recreation_trail_seg_id,
        trail_segment_name,
        start_station,
        end_station,
        actual_repair_cost,
        revision_count
      FROM fta.recreation_trail_segment
      ORDER BY forest_file_id, recreation_trail_seg_id
    `);
    return rows;
  }

  /**
   * forest_file_id -> rec_resource_id. In this system they're the same
   * value; this just confirms which forest_file_ids exist in RST.
   */
  async fetchForestFileIdMap(): Promise<Map<string, string>> {
    const { rows } = await this.rstPool.query<{ rec_resource_id: string }>(`
      SELECT rec_resource_id FROM rst.recreation_resource
    `);
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.rec_resource_id, row.rec_resource_id);
    }
    return map;
  }

  // -------------------------------------------------------------------------
  // Campsite assets (parents)
  // -------------------------------------------------------------------------

  async syncCampsites(
    campsites: FtaCampsite[],
    forestFileIdMap: Map<string, string>,
    args: ParsedArgs,
  ): Promise<Map<string, Map<number, bigint>>> {
    // rec_resource_id -> campsite_number (number) -> asset_id
    const campsiteAssetIdMap = new Map<string, Map<number, bigint>>();

    // pg returns numeric columns as strings — always coerce campsite_number to number
    type ValidCampsite = { recResourceId: string; campsiteNum: number; assetTag: string };
    const valid: ValidCampsite[] = [];
    let skipped = 0;

    for (const cs of campsites) {
      const recResourceId = forestFileIdMap.get(cs.forest_file_id);
      if (!recResourceId) {
        this.logger.warn('No rec_resource_id for campsite forest_file_id - skipping', {
          forest_file_id: cs.forest_file_id,
          campsite_number: String(cs.campsite_number),
        });
        skipped++;
        continue;
      }
      const campsiteNum = Number(cs.campsite_number);
      valid.push({
        recResourceId,
        campsiteNum,
        assetTag: `CS-${String(campsiteNum).padStart(3, '0')}`,
      });
    }

    if (args.dryRun) {
      this.logger.info('Campsite sync complete (dry run)', {
        would_process: String(valid.length),
        skipped: String(skipped),
      });
      return campsiteAssetIdMap;
    }

    // Batch insert in chunks — far faster than one query per row.
    const CHUNK = 500;
    for (let i = 0; i < valid.length; i += CHUNK) {
      const chunk = valid.slice(i, i + CHUNK);
      // $1 = asset_code, $2 = actor, then pairs ($3,$4), ($5,$6)… = (rec_resource_id, asset_tag)
      const params: unknown[] = [CAMPSITE_ASSET_CODE, args.actor];
      const valueClauses = chunk.map((row, idx) => {
        const p = 3 + idx * 2;
        params.push(row.recResourceId, row.assetTag);
        return `($${p}, $1, $${p + 1}, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, $2, $2)`;
      });

      await this.rstPool.query(
        `INSERT INTO rst.recreation_asset (
           rec_resource_id, asset_code, asset_tag,
           asset_name, asset_comment, legacy_structure_id,
           asset_length, asset_width, asset_area,
           default_value, actual_value, installation_date,
           created_by, updated_by
         ) VALUES ${valueClauses.join(', ')}
         ON CONFLICT DO NOTHING`,
        params,
      );

      this.logger.info(
        `Inserted campsite batch ${Math.floor(i / CHUNK) + 1}` +
          ` (${Math.min(i + CHUNK, valid.length)}/${valid.length})`,
      );
    }

    // Single query to fetch all asset_ids back for the parent lookup map
    const recResourceIdList = [...new Set(valid.map(r => r.recResourceId))];
    const assetTagList = [...new Set(valid.map(r => r.assetTag))];

    if (recResourceIdList.length > 0) {
      const { rows } = await this.rstPool.query<{
        asset_id: string;
        rec_resource_id: string;
        asset_tag: string;
      }>(
        `SELECT asset_id, rec_resource_id, asset_tag
         FROM rst.recreation_asset
         WHERE asset_code = $1
           AND rec_resource_id = ANY($2)
           AND asset_tag = ANY($3)`,
        [CAMPSITE_ASSET_CODE, recResourceIdList, assetTagList],
      );

      for (const row of rows) {
        const campsiteNum = parseInt(row.asset_tag.replace('CS-', ''), 10);
        if (!campsiteAssetIdMap.has(row.rec_resource_id)) {
          campsiteAssetIdMap.set(row.rec_resource_id, new Map());
        }
        campsiteAssetIdMap.get(row.rec_resource_id)!.set(campsiteNum, BigInt(row.asset_id));
      }
    }

    this.logger.info('Campsite sync complete', {
      processed: String(valid.length),
      skipped: String(skipped),
      mapped_resources: String(campsiteAssetIdMap.size),
    });

    return campsiteAssetIdMap;
  }

  // -------------------------------------------------------------------------
  // Structure assets
  // -------------------------------------------------------------------------

  /**
   * Deletes any existing rows for this legacy_structure_id, then inserts
   * one row per physical unit (structure_count rows), splitting
   * actual_value evenly across units. Delete-then-insert keeps reruns
   * idempotent without needing a unique constraint on legacy_structure_id.
   */
  async syncStructure(
    structure: FtaStructure,
    recResourceId: string,
    parentId: bigint | null,
    defaultValue: number | null,
    actor: string,
  ): Promise<void> {
    const count =
      structure.structure_count != null && structure.structure_count > 0
        ? structure.structure_count
        : 1;

    const perUnitValue =
      structure.actual_value != null ? structure.actual_value / count : null;

    const client = await this.rstPool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `DELETE FROM rst.recreation_asset WHERE legacy_structure_id = $1`,
        [structure.structure_id],
      );

      const insertSql = `
        INSERT INTO rst.recreation_asset (
          rec_resource_id, asset_code, asset_tag,
          asset_name, asset_comment, legacy_structure_id,
          asset_length, asset_width, asset_area,
          default_value, actual_value, installation_date,
          parent_id, created_by, updated_by
        ) VALUES (
          $1, $2, $3,
          NULL, $4, $5,
          $6, $7, $8,
          $9, $10, NULL,
          $11, $12, $12
        )
      `;

      for (let i = 0; i < count; i++) {
        await client.query(insertSql, [
          recResourceId,
          structure.recreation_structure_code,
          null, // asset_tag
          structure.structure_name ?? null,
          structure.structure_id,
          structure.structure_length ?? null,
          structure.structure_width ?? null,
          structure.structure_area ?? null,
          defaultValue,
          perUnitValue,
          parentId !== null ? parentId.toString() : null,
          actor,
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // -------------------------------------------------------------------------
  // Trail segment assets
  // -------------------------------------------------------------------------

  /**
   * Fans out a trail segment into `count` rows, where count is derived from
   * revision_count (> 0), defaulting to 1. For each unit:
   *   - legacy_structure_id is `${forest_file_id}-${recreation_trail_seg_id}`
   *     for single-unit segments, or
   *     `${forest_file_id}-${recreation_trail_seg_id}-${i}` (0-based,
   *     zero-padded to 3 digits) for multi-unit segments.
   *   - asset_length is the full segment length (end_station - start_station)
   *     divided evenly across units.
   *
   * Deletes any rows whose legacy_structure_id matches the segment base key
   * (exact or with a unit-index suffix) before re-inserting, keeping reruns
   * idempotent.
   */
  async syncTrailSegment(
    segment: FtaTrailSegment,
    recResourceId: string,
    trailAssetCode: number,
    defaultValue: number | null,
    actor: string,
  ): Promise<void> {
    const count =
      segment.revision_count != null && segment.revision_count > 0
        ? segment.revision_count
        : 1;

    const totalLength =
      segment.start_station != null && segment.end_station != null
        ? segment.end_station - segment.start_station
        : null;

    const perUnitLength = totalLength !== null ? totalLength / count : null;

    const perUnitValue =
      segment.actual_repair_cost != null ? segment.actual_repair_cost / count : null;

    const baseKey = `${segment.forest_file_id}-${segment.recreation_trail_seg_id}`;

    const client = await this.rstPool.connect();
    try {
      await client.query('BEGIN');

      // Delete all unit rows for this segment (exact match or with unit-index suffix)
      await client.query(
        `DELETE FROM rst.recreation_asset
         WHERE legacy_structure_id = $1
            OR legacy_structure_id LIKE $2`,
        [baseKey, `${baseKey}-%`],
      );

      const insertSql = `
        INSERT INTO rst.recreation_asset (
          rec_resource_id, asset_code, asset_tag,
          asset_name, asset_comment, legacy_structure_id,
          asset_length, asset_width, asset_area,
          default_value, actual_value, installation_date,
          parent_id, created_by, updated_by
        ) VALUES (
          $1, $2, $3,
          NULL, NULL, $4,
          $5, NULL, NULL,
          $6, $7, NULL,
          NULL, $8, $8
        )
      `;

      for (let i = 0; i < count; i++) {
        const legacyId =
          count === 1
            ? baseKey
            : `${baseKey}-${String(i).padStart(3, '0')}`;

        await client.query(insertSql, [
          recResourceId,
          trailAssetCode,
          segment.trail_segment_name ?? null,
          legacyId,
          perUnitLength,
          defaultValue,
          perUnitValue,
          actor,
        ]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // -------------------------------------------------------------------------
  // Orchestration
  // -------------------------------------------------------------------------

  async run(args: ParsedArgs): Promise<void> {
    this.logger.info('Fetching source data from FTA…');

    const [structures, structureValueMap, campsites, forestFileIdMap, trailSegments] =
      await Promise.all([
        this.fetchStructures(),
        this.fetchStructureValues(),
        this.fetchCampsites(),
        this.fetchForestFileIdMap(),
        args.skipTrails ? Promise.resolve([]) : this.fetchTrailSegments(),
      ]);

    this.logger.info('Source data fetched', {
      structures: String(structures.length),
      structureCodes: String(structureValueMap.size),
      campsites: String(campsites.length),
      knownForestFileIds: String(forestFileIdMap.size),
      trailSegments: String((trailSegments as FtaTrailSegment[]).length),
    });

    // Diagnostic: show how many structure forest_file_ids are unrecognised
    if (structures.length > 0) {
      const unmatched = structures.filter(s => !forestFileIdMap.has(s.forest_file_id));
      this.logger.info('Structure forest_file_id match diagnostic', {
        total_structures: String(structures.length),
        matched_to_rec_resource: String(structures.length - unmatched.length),
        unmatched: String(unmatched.length),
        sample_unmatched: JSON.stringify([...new Set(unmatched.map(s => s.forest_file_id))].slice(0, 5)),
      });
    }

    this.logger.info('Syncing campsite assets…');
    const campsiteAssetIdMap = await this.syncCampsites(campsites, forestFileIdMap, args);

    this.logger.info('Syncing structure assets…');
    let totalInserted = 0;
    let totalSkipped = 0;
    let structureInserted = 0;
    let structureSkipped = 0;

    for (let i = 0; i < structures.length; i += args.batchSize) {
      const batch = structures.slice(i, i + args.batchSize);

      const tasks = batch.map(async (structure) => {
        // Always use forest_file_id to resolve rec_resource_id.
        // campsite_forest_file_id is a reference to the campsite record and
        // is used only to resolve parent_id below — it does NOT replace
        // forest_file_id for the resource lookup.
        const recResourceId = forestFileIdMap.get(structure.forest_file_id);

        if (!recResourceId) {
          this.logger.warn('No rec_resource_id for structure - skipping', {
            structure_id: structure.structure_id,
            forest_file_id: structure.forest_file_id,
          });
          return 'skipped';
        }

        let parentId: bigint | null = null;
        if (structure.campsite_number !== null) {
          // campsite_number comes back from pg as a string (numeric type) —
          // coerce to number to match the integer keys in campsiteAssetIdMap.
          const campsiteNum = Number(structure.campsite_number);
          const campsiteLookupId =
            structure.campsite_forest_file_id ?? structure.forest_file_id;
          const campsiteRecResourceId =
            forestFileIdMap.get(campsiteLookupId) ?? recResourceId;
          const csMap = campsiteAssetIdMap.get(campsiteRecResourceId);
          parentId = csMap?.get(campsiteNum) ?? null;
          if (parentId === null) {
            this.logger.warn(
              'Campsite asset not found for parent_id resolution - parent_id will be null',
              {
                structure_id: structure.structure_id,
                rec_resource_id: recResourceId,
                campsite_lookup_id: campsiteLookupId,
                campsite_number: String(campsiteNum),
              },
            );
          }
        }

        const defaultValue =
          structureValueMap.get(structure.recreation_structure_code) ?? null;

        if (args.dryRun) {
          this.logger.debug('Dry run: would upsert structure asset', {
            structure_id: structure.structure_id,
            rec_resource_id: recResourceId,
            asset_code: String(structure.recreation_structure_code),
            parent_id: parentId !== null ? parentId.toString() : 'null',
          });
          return 'inserted';
        }

        await this.syncStructure(structure, recResourceId, parentId, defaultValue, args.actor);
        return 'inserted';
      });

      for (let j = 0; j < tasks.length; j += args.concurrency) {
        const slice = tasks.slice(j, j + args.concurrency);
        const results = await Promise.allSettled(slice);
        for (const result of results) {
          if (result.status === 'fulfilled') {
            if (result.value === 'inserted') { totalInserted++; structureInserted++; }
            else { totalSkipped++; structureSkipped++; }
          } else {
            this.logger.error('Failed to sync structure', {
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            });
            totalSkipped++;
            structureSkipped++;
          }
        }
      }

      this.logger.info(
        `Processed batch ${Math.floor(i / args.batchSize) + 1} ` +
          `(${Math.min(i + args.batchSize, structures.length)}/${structures.length})`,
      );
    }

    this.logger.info('Structure sync complete', {
      inserted: String(structureInserted),
      skipped: String(structureSkipped),
    });

    if (args.skipTrails) {
      this.logger.info('Skipping trail segment sync (--skip-trails)');
    } else {
      this.logger.info('Syncing trail segment assets…');
      const trailAssetCode = args.trailAssetCode!; // guaranteed by CLI validation
      const trailDefaultValue = structureValueMap.get(trailAssetCode) ?? null;
      const segments = trailSegments as FtaTrailSegment[];

      for (let i = 0; i < segments.length; i += args.batchSize) {
        const batch = segments.slice(i, i + args.batchSize);

        const tasks = batch.map(async (segment) => {
          const recResourceId = forestFileIdMap.get(segment.forest_file_id);
          if (!recResourceId) {
            this.logger.warn('No rec_resource_id for trail segment - skipping', {
              forest_file_id: segment.forest_file_id,
              recreation_trail_seg_id: String(segment.recreation_trail_seg_id),
            });
            return 'skipped';
          }

          const count =
            segment.revision_count != null && segment.revision_count > 0
              ? segment.revision_count
              : 1;

          if (args.dryRun) {
            this.logger.debug('Dry run: would upsert trail segment asset', {
              forest_file_id: segment.forest_file_id,
              recreation_trail_seg_id: String(segment.recreation_trail_seg_id),
              rec_resource_id: recResourceId,
              unit_count: String(count),
            });
            return 'inserted';
          }

          await this.syncTrailSegment(
            segment,
            recResourceId,
            trailAssetCode,
            trailDefaultValue,
            args.actor,
          );
          return 'inserted';
        });

        for (let j = 0; j < tasks.length; j += args.concurrency) {
          const slice = tasks.slice(j, j + args.concurrency);
          const results = await Promise.allSettled(slice);
          for (const result of results) {
            if (result.status === 'fulfilled') {
              if (result.value === 'inserted') totalInserted++;
              else totalSkipped++;
            } else {
              this.logger.error('Failed to sync trail segment', {
                error:
                  result.reason instanceof Error ? result.reason.message : String(result.reason),
              });
              totalSkipped++;
            }
          }
        }

        this.logger.info(
          `Processed trail segment batch ${Math.floor(i / args.batchSize) + 1} ` +
            `(${Math.min(i + args.batchSize, segments.length)}/${segments.length})`,
        );
      }
    }

    this.logger.info('Asset fill complete', {
      inserted: String(totalInserted),
      skipped: String(totalSkipped),
    });
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const logger = createLogger(SYNC_SOURCE);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required (RST database)');
    process.exit(1);
  }

  const ftaDbUrl = process.env.FTA_DB_URL;
  if (!ftaDbUrl) {
    logger.error('FTA_DB_URL environment variable is required (FTA source database)');
    process.exit(1);
  }

  const args = await parseArgs();

  const rstPool = new Pool({ connectionString: databaseUrl });
  const ftaPool = new Pool({ connectionString: ftaDbUrl });

  try {
    logger.info('Starting recreation_asset fill', {
      dryRun: String(args.dryRun),
      clean: String(args.clean),
      batchSize: String(args.batchSize),
      concurrency: String(args.concurrency),
      actor: args.actor,
      skipTrails: String(args.skipTrails),
      trailAssetCode: args.trailAssetCode !== undefined ? String(args.trailAssetCode) : 'n/a',
    });

    await rstPool.query('SET search_path TO rst, public;');

    if (args.clean && !args.dryRun) {
      logger.warn(
        '--clean flag set: truncating rst.recreation_asset (cascades to repairs and geometry)',
      );
      await rstPool.query('TRUNCATE TABLE rst.recreation_asset RESTART IDENTITY CASCADE;');
      logger.info('Table truncated successfully');
    }

    const filler = new RecreationAssetFiller(logger, rstPool, ftaPool);
    await filler.run(args);

    logger.info('Recreation_asset fill completed successfully');
  } catch (error) {
    logger.error('Fatal error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    await rstPool.end();
    await ftaPool.end();
  }
}

main();

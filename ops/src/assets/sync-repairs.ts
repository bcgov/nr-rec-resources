/**
 * Script to fill rst.recreation_asset_repair from FTA repair data.
 *
 * Source tables (fta schema):
 *   fta.recreation_structure
 *     - repair rows where recreation_remed_repair_code IS NOT NULL
 *     - asset_id resolved via rst.recreation_asset.legacy_structure_id = structure_id::text
 *
 *   fta.recreation_defined_campsite
 *     - repair rows where recreation_remed_repair_code IS NOT NULL
 *     - asset_id resolved via (rec_resource_id, asset_code=227, asset_tag="CS-###")
 *
 *   fta.recreation_trail_segment
 *     - repair rows where recreation_remed_repair_code IS NOT NULL
 *     - asset_id resolved via rst.recreation_asset.legacy_structure_id
 *       = "${forest_file_id}-${recreation_trail_seg_id}"
 *     - trail_segment_start / trail_segment_end populated from start_station / end_station
 *
 * Target table: rst.recreation_asset_repair
 *   repair_id                  - auto-generated
 *   asset_id                   - resolved as above
 *   recreation_remed_repair_code
 *   estimated_repair_cost
 *   actual_repair_cost         - null for structures/campsites (no source column)
 *   repair_completed_date
 *   urgency                    - null (no source column)
 *   trail_segment_start        - start_station (trail segments only)
 *   trail_segment_end          - end_station (trail segments only)
 *   created_at / updated_at    - column defaults (now())
 *   created_by / updated_by    - --actor value
 *
 * Idempotency:
 *   The table has no natural unique key on (asset_id, source), so re-running
 *   would duplicate rows. This script DELETEs existing repair rows for each
 *   asset_id before re-inserting, keeping reruns safe.
 *   Use --clean to truncate the whole table before syncing.
 *
 * Usage:
 *   npx tsx ops/src/assets/sync-repairs.ts [options]
 *
 * Environment variables:
 *   DATABASE_URL  - RST PostgreSQL connection string (required)
 *   FTA_DB_URL    - FTA PostgreSQL connection string (required; may be same db)
 *   LOG_LEVEL     - Winston log level (default: info)
 */

import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger, Logger } from '../logger';

const SYNC_SOURCE = 'sync-repairs';
const CAMPSITE_ASSET_CODE = 227;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface ParsedArgs {
  dryRun: boolean;
  clean: boolean;
  batchSize: number;
  actor: string;
  skipTrails: boolean;
}

async function parseArgs(): Promise<ParsedArgs> {
  const parsed = await yargs(hideBin(process.argv))
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Fetch and transform data without writing to RST',
    })
    .option('clean', {
      type: 'boolean',
      default: false,
      description: 'Truncate rst.recreation_asset_repair before syncing',
    })
    .option('batch-size', {
      type: 'number',
      default: 500,
      description: 'Number of repair rows to insert per batch',
    })
    .option('actor', {
      type: 'string',
      default: 'fta-migration',
      description: 'Value written to created_by/updated_by',
    })
    .option('skip-trails', {
      type: 'boolean',
      default: true,
      description:
        'Skip trail segment repairs. Defaults to true; pass --no-skip-trails to include them.',
    })
    .help()
    .parseAsync();

  return {
    dryRun: parsed['dry-run'] as boolean,
    clean: parsed.clean as boolean,
    batchSize: parsed['batch-size'] as number,
    actor: parsed.actor as string,
    skipTrails: parsed['skip-trails'] as boolean,
  };
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

interface RepairRow {
  asset_id: bigint;
  recreation_remed_repair_code: string;
  estimated_repair_cost: number | null;
  actual_repair_cost: number | null;
  repair_completed_date: Date | null;
  trail_segment_start: number | null;
  trail_segment_end: number | null;
}

// ---------------------------------------------------------------------------
// Main class
// ---------------------------------------------------------------------------

class RepairSync {
  private logger: Logger;
  private rstPool: Pool;
  private ftaPool: Pool;

  constructor(logger: Logger, rstPool: Pool, ftaPool: Pool) {
    this.logger = logger;
    this.rstPool = rstPool;
    this.ftaPool = ftaPool;
  }

  // -------------------------------------------------------------------------
  // Lookup helpers
  // -------------------------------------------------------------------------

  /**
   * Returns a map of legacy_structure_id -> asset_id for all structure/trail
   * assets currently in rst.recreation_asset.
   */
  async fetchLegacyIdToAssetIdMap(): Promise<Map<string, bigint>> {
    const { rows } = await this.rstPool.query<{
      asset_id: string;
      legacy_structure_id: string;
    }>(`
      SELECT asset_id, legacy_structure_id
      FROM rst.recreation_asset
      WHERE legacy_structure_id IS NOT NULL
    `);
    const map = new Map<string, bigint>();
    for (const row of rows) {
      // Fan-out structures share the same legacy_structure_id — keep the
      // first one (repairs are per-structure, not per fan-out unit).
      if (!map.has(row.legacy_structure_id)) {
        map.set(row.legacy_structure_id, BigInt(row.asset_id));
      }
    }
    return map;
  }

  /**
   * Returns a map of "rec_resource_id|CS-###" -> asset_id for campsite assets.
   */
  async fetchCampsiteAssetIdMap(): Promise<Map<string, bigint>> {
    const { rows } = await this.rstPool.query<{
      asset_id: string;
      rec_resource_id: string;
      asset_tag: string;
    }>(`
      SELECT asset_id, rec_resource_id, asset_tag
      FROM rst.recreation_asset
      WHERE asset_code = $1
        AND asset_tag IS NOT NULL
    `, [CAMPSITE_ASSET_CODE]);
    const map = new Map<string, bigint>();
    for (const row of rows) {
      map.set(`${row.rec_resource_id}|${row.asset_tag}`, BigInt(row.asset_id));
    }
    return map;
  }

  // -------------------------------------------------------------------------
  // Build repair rows from each source
  // -------------------------------------------------------------------------

  async buildStructureRepairs(
    legacyIdMap: Map<string, bigint>,
  ): Promise<RepairRow[]> {
    const { rows } = await this.ftaPool.query<{
      structure_id: string;
      recreation_remed_repair_code: string;
      estimated_repair_cost: string | null;
      repair_completed_date: Date | null;
    }>(`
      SELECT
        structure_id::text,
        recreation_remed_repair_code,
        estimated_repair_cost,
        repair_completed_date
      FROM fta.recreation_structure
      WHERE recreation_remed_repair_code IS NOT NULL
      ORDER BY structure_id
    `);

    const repairs: RepairRow[] = [];
    let skipped = 0;

    for (const row of rows) {
      const assetId = legacyIdMap.get(row.structure_id);
      if (!assetId) {
        this.logger.warn('No asset found for structure repair - skipping', {
          structure_id: row.structure_id,
        });
        skipped++;
        continue;
      }
      repairs.push({
        asset_id: assetId,
        recreation_remed_repair_code: row.recreation_remed_repair_code,
        estimated_repair_cost: row.estimated_repair_cost != null ? Number(row.estimated_repair_cost) : null,
        actual_repair_cost: null, // not available on structure
        repair_completed_date: row.repair_completed_date,
        trail_segment_start: null,
        trail_segment_end: null,
      });
    }

    this.logger.info('Structure repairs built', {
      count: String(repairs.length),
      skipped: String(skipped),
    });
    return repairs;
  }

  async buildCampsiteRepairs(
    campsiteAssetIdMap: Map<string, bigint>,
  ): Promise<RepairRow[]> {
    const { rows } = await this.ftaPool.query<{
      forest_file_id: string;
      campsite_number: string;
      recreation_remed_repair_code: string;
      estimated_repair_cost: string | null;
      repair_complete_date: Date | null;
    }>(`
      SELECT
        forest_file_id,
        campsite_number,
        recreation_remed_repair_code,
        estimated_repair_cost,
        repair_complete_date
      FROM fta.recreation_defined_campsite
      WHERE recreation_remed_repair_code IS NOT NULL
      ORDER BY forest_file_id, campsite_number
    `);

    const repairs: RepairRow[] = [];
    let skipped = 0;

    for (const row of rows) {
      const campsiteNum = Number(row.campsite_number);
      const assetTag = `CS-${String(campsiteNum).padStart(3, '0')}`;
      const mapKey = `${row.forest_file_id}|${assetTag}`;
      const assetId = campsiteAssetIdMap.get(mapKey);

      if (!assetId) {
        this.logger.warn('No asset found for campsite repair - skipping', {
          forest_file_id: row.forest_file_id,
          campsite_number: String(campsiteNum),
        });
        skipped++;
        continue;
      }

      repairs.push({
        asset_id: assetId,
        recreation_remed_repair_code: row.recreation_remed_repair_code,
        estimated_repair_cost: row.estimated_repair_cost != null ? Number(row.estimated_repair_cost) : null,
        actual_repair_cost: null, // not available on campsite
        repair_completed_date: row.repair_complete_date,
        trail_segment_start: null,
        trail_segment_end: null,
      });
    }

    this.logger.info('Campsite repairs built', {
      count: String(repairs.length),
      skipped: String(skipped),
    });
    return repairs;
  }

  async buildTrailRepairs(
    legacyIdMap: Map<string, bigint>,
  ): Promise<RepairRow[]> {
    const { rows } = await this.ftaPool.query<{
      forest_file_id: string;
      recreation_trail_seg_id: string;
      recreation_remed_repair_code: string;
      estimated_repair_cost: string | null;
      actual_repair_cost: string | null;
      repair_completed_date: Date | null;
      start_station: string | null;
      end_station: string | null;
    }>(`
      SELECT
        forest_file_id,
        recreation_trail_seg_id::text,
        recreation_remed_repair_code,
        estimated_repair_cost,
        actual_repair_cost,
        repair_completed_date,
        start_station,
        end_station
      FROM fta.recreation_trail_segment
      WHERE recreation_remed_repair_code IS NOT NULL
      ORDER BY forest_file_id, recreation_trail_seg_id
    `);

    const repairs: RepairRow[] = [];
    let skipped = 0;

    for (const row of rows) {
      const legacyId = `${row.forest_file_id}-${row.recreation_trail_seg_id}`;
      const assetId = legacyIdMap.get(legacyId);

      if (!assetId) {
        this.logger.warn('No asset found for trail segment repair - skipping', {
          legacy_id: legacyId,
        });
        skipped++;
        continue;
      }

      repairs.push({
        asset_id: assetId,
        recreation_remed_repair_code: row.recreation_remed_repair_code,
        estimated_repair_cost: row.estimated_repair_cost != null ? Number(row.estimated_repair_cost) : null,
        actual_repair_cost: row.actual_repair_cost != null ? Number(row.actual_repair_cost) : null,
        repair_completed_date: row.repair_completed_date,
        trail_segment_start: row.start_station != null ? Number(row.start_station) : null,
        trail_segment_end: row.end_station != null ? Number(row.end_station) : null,
      });
    }

    this.logger.info('Trail segment repairs built', {
      count: String(repairs.length),
      skipped: String(skipped),
    });
    return repairs;
  }

  // -------------------------------------------------------------------------
  // Insert repairs
  // -------------------------------------------------------------------------

  async insertRepairs(
    repairs: RepairRow[],
    actor: string,
    batchSize: number,
    dryRun: boolean,
  ): Promise<void> {
    if (repairs.length === 0) {
      this.logger.info('No repair rows to insert');
      return;
    }

    if (dryRun) {
      this.logger.info('Dry run: would insert repair rows', {
        count: String(repairs.length),
      });
      return;
    }

    // Delete existing repairs for each asset_id to keep reruns idempotent
    const assetIds = [...new Set(repairs.map(r => r.asset_id.toString()))];
    this.logger.info('Deleting existing repairs for affected assets', {
      asset_count: String(assetIds.length),
    });
    await this.rstPool.query(
      `DELETE FROM rst.recreation_asset_repair WHERE asset_id = ANY($1::bigint[])`,
      [assetIds],
    );

    // Batch insert
    let inserted = 0;
    for (let i = 0; i < repairs.length; i += batchSize) {
      const batch = repairs.slice(i, i + batchSize);

      // Build multi-row VALUES clause
      // Columns: asset_id, recreation_remed_repair_code, estimated_repair_cost,
      //          actual_repair_cost, repair_completed_date, urgency,
      //          trail_segment_start, trail_segment_end, created_by, updated_by
      const COL_COUNT = 10;
      const params: unknown[] = [];
      const valueClauses = batch.map((row, idx) => {
        const base = idx * COL_COUNT + 1;
        params.push(
          row.asset_id.toString(),            // $1  asset_id
          row.recreation_remed_repair_code,   // $2  recreation_remed_repair_code
          row.estimated_repair_cost,          // $3  estimated_repair_cost
          row.actual_repair_cost,             // $4  actual_repair_cost
          row.repair_completed_date,          // $5  repair_completed_date
          null,                               // $6  urgency (no source)
          row.trail_segment_start,            // $7  trail_segment_start
          row.trail_segment_end,              // $8  trail_segment_end
          actor,                              // $9  created_by
          actor,                              // $10 updated_by
        );
        return `($${base},$${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9})`;
      });

      await this.rstPool.query(
        `INSERT INTO rst.recreation_asset_repair (
           asset_id, recreation_remed_repair_code,
           estimated_repair_cost, actual_repair_cost,
           repair_completed_date, urgency,
           trail_segment_start, trail_segment_end,
           created_by, updated_by
         ) VALUES ${valueClauses.join(', ')}`,
        params,
      );

      inserted += batch.length;
      this.logger.info(
        `Inserted repair batch ${Math.floor(i / batchSize) + 1}` +
          ` (${inserted}/${repairs.length})`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Orchestration
  // -------------------------------------------------------------------------

  async run(args: ParsedArgs): Promise<void> {
    this.logger.info('Loading asset lookup maps from RST…');
    const [legacyIdMap, campsiteAssetIdMap] = await Promise.all([
      this.fetchLegacyIdToAssetIdMap(),
      this.fetchCampsiteAssetIdMap(),
    ]);
    this.logger.info('Asset maps loaded', {
      legacy_structure_ids: String(legacyIdMap.size),
      campsite_assets: String(campsiteAssetIdMap.size),
    });

    this.logger.info('Building repair rows from FTA…');
    const [structureRepairs, campsiteRepairs, trailRepairs] = await Promise.all([
      this.buildStructureRepairs(legacyIdMap),
      this.buildCampsiteRepairs(campsiteAssetIdMap),
      args.skipTrails
        ? Promise.resolve([] as RepairRow[])
        : this.buildTrailRepairs(legacyIdMap),
    ]);

    const allRepairs = [...structureRepairs, ...campsiteRepairs, ...trailRepairs];
    this.logger.info('Total repair rows to insert', {
      structures: String(structureRepairs.length),
      campsites: String(campsiteRepairs.length),
      trails: String(trailRepairs.length),
      total: String(allRepairs.length),
    });

    await this.insertRepairs(allRepairs, args.actor, args.batchSize, args.dryRun);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

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

  const args = await parseArgs();

  const rstPool = new Pool({ connectionString: databaseUrl });
  const ftaPool = new Pool({ connectionString: ftaDbUrl });

  try {
    logger.info('Starting repair sync', {
      dryRun: String(args.dryRun),
      clean: String(args.clean),
      batchSize: String(args.batchSize),
      actor: args.actor,
      skipTrails: String(args.skipTrails),
    });

    await rstPool.query('SET search_path TO rst, public;');

    // Verify FTA connectivity before touching the target table
    await ftaPool.query('SELECT 1');

    if (args.clean && !args.dryRun) {
      logger.warn('--clean flag set: truncating rst.recreation_asset_repair');
      await rstPool.query('TRUNCATE TABLE rst.recreation_asset_repair RESTART IDENTITY CASCADE;');
      logger.info('Table truncated successfully');
    }

    const syncer = new RepairSync(logger, rstPool, ftaPool);
    await syncer.run(args);

    logger.info('Repair sync completed successfully');
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


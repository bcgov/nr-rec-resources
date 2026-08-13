/**
 * One-time script to populate rst.recreation_asset from FTA source tables.
 *
 * Sources:
 *   - fta.recreation_defined_campsite  → campsite assets (become parents)
 *   - fta.recreation_structure         → structure assets (child if campsite_number set)
 *   - fta.recreation_structure_value   → default_value per structure code
 *
 * Steps:
 *   1. Insert one campsite asset per (forest_file_id, campsite_number) from FTA.
 *   2. Insert one structure asset per fta.recreation_structure row, resolving
 *      parent_id to the campsite asset when campsite_number is populated.
 *   3. Insert repair rows into rst.recreation_asset_repair for structures that
 *      carry a recreation_remed_repair_code.
 *
 * Usage:
 *   npx tsx src/assets/migrate-fta-assets.ts [--dry-run]
 *
 * Environment variables:
 *   DATABASE_URL  – PostgreSQL connection string (required)
 *   LOG_LEVEL     – Winston log level (default: info)
 */

import { Pool, PoolClient } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

const SCRIPT_SOURCE = 'migrate-fta-assets';

interface ParsedArgs {
  dryRun: boolean;
}

async function parseArgs(): Promise<ParsedArgs> {
  const argv = await yargs(hideBin(process.argv))
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: false,
      description: 'Print SQL row counts without committing',
    })
    .strict()
    .parse();

  return { dryRun: argv['dry-run'] as boolean };
}

// ─── Step 1: Campsite assets ──────────────────────────────────────────────────

const INSERT_CAMPSITE_ASSETS = /* sql */ `
INSERT INTO rst.recreation_asset (
    rec_resource_id,
    recreation_structure_code,
    asset_tag,
    asset_name,
    asset_comment,
    legacy_structure_id,
    asset_length,
    asset_width,
    asset_area,
    default_value,
    actual_value,
    installation_date,
    updated_at,
    updated_by,
    created_at,
    created_by
)
SELECT
    fdc.forest_file_id,
    133                                                AS recreation_structure_code, -- Campsite code in rst.recreation_structure_code
    NULL                                               AS asset_tag,
    'Campsite ' || fdc.campsite_number                 AS asset_name,
    NULL                                               AS asset_comment,
    NULL                                               AS legacy_structure_id,
    NULL, NULL, NULL, NULL, NULL, NULL,
    fdc.update_timestamp  AS updated_at,
    fdc.update_userid     AS updated_by,
    fdc.entry_timestamp   AS created_at,
    fdc.entry_userid      AS created_by
FROM fta.recreation_defined_campsite fdc
-- keep only the latest revision per (forest_file_id, campsite_number)
INNER JOIN (
    SELECT forest_file_id, campsite_number, MAX(revision_count) AS max_revision_count
    FROM fta.recreation_defined_campsite
    GROUP BY forest_file_id, campsite_number
) latest
    ON fdc.forest_file_id  = latest.forest_file_id
   AND fdc.campsite_number = latest.campsite_number
   AND fdc.revision_count  = latest.max_revision_count
-- only for resources that already exist in RST
WHERE EXISTS (
    SELECT 1 FROM rst.recreation_resource rr
    WHERE rr.rec_resource_id = fdc.forest_file_id
);
`;

// ─── Step 2: Structure assets ─────────────────────────────────────────────────

const INSERT_STRUCTURE_ASSETS = /* sql */ `
INSERT INTO rst.recreation_asset (
    parent_id,
    rec_resource_id,
    recreation_structure_code,
    asset_name,
    asset_comment,
    legacy_structure_id,
    asset_length,
    asset_width,
    asset_area,
    default_value,
    actual_value,
    installation_date,
    updated_at,
    updated_by,
    created_at,
    created_by
)
SELECT
    -- parent_id: campsite asset for this structure, when campsite_number is set
    campsite_asset.asset_id                   AS parent_id,
    rs.forest_file_id                         AS rec_resource_id,
    rs.recreation_structure_code              AS recreation_structure_code,
    NULL                                      AS asset_name,
    rs.structure_name                         AS asset_comment,
    rs.structure_id::varchar                  AS legacy_structure_id,
    rs.structure_length                       AS asset_length,
    rs.structure_width                        AS asset_width,
    rs.structure_area                         AS asset_area,
    rsv.structure_value                       AS default_value,
    rs.actual_value                           AS actual_value,
    NULL                                      AS installation_date,
    rs.update_timestamp                       AS updated_at,
    rs.update_userid                          AS updated_by,
    rs.entry_timestamp                        AS created_at,
    rs.entry_userid                           AS created_by
FROM fta.recreation_structure rs
-- default_value from the structure value lookup table
LEFT JOIN fta.recreation_structure_value rsv
    ON rsv.recreation_structure_code = rs.recreation_structure_code::varchar
-- resolve campsite parent (NULL when campsite_number is NULL)
LEFT JOIN rst.recreation_asset campsite_asset
    ON rs.campsite_number IS NOT NULL
   AND campsite_asset.rec_resource_id = COALESCE(rs.campsite_forest_file_id, rs.forest_file_id)
   AND campsite_asset.asset_tag       IS NULL
   AND campsite_asset.asset_name      = 'Campsite ' || rs.campsite_number
-- only migrate structures whose site already exists in RST
WHERE EXISTS (
    SELECT 1 FROM rst.recreation_resource rr
    WHERE rr.rec_resource_id = rs.forest_file_id
);
`;

// ─── Step 3: Repair records for structures ────────────────────────────────────

const INSERT_STRUCTURE_REPAIRS = /* sql */ `
INSERT INTO rst.recreation_asset_repair (
    asset_id,
    recreation_remed_repair_code,
    estimated_repair_cost,
    actual_repair_cost,
    repair_completed_date
)
SELECT
    ra.asset_id,
    rs.recreation_remed_repair_code,
    rs.estimated_repair_cost,
    NULL                          AS actual_repair_cost,
    rs.repair_completed_date
FROM fta.recreation_structure rs
JOIN rst.recreation_asset ra
    ON ra.legacy_structure_id = rs.structure_id::varchar
WHERE rs.recreation_remed_repair_code IS NOT NULL
   OR rs.estimated_repair_cost        IS NOT NULL
   OR rs.repair_completed_date        IS NOT NULL;
`;

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run(
  client: PoolClient,
  dryRun: boolean,
  logger: ReturnType<typeof createLogger>,
) {
  logger.info('Starting FTA → RST recreation_asset migration', { dryRun });

  // Step 1 – campsite assets
  logger.info('Step 1: Inserting campsite assets …');
  const campsiteResult = await client.query(INSERT_CAMPSITE_ASSETS);
  logger.info('Campsite assets inserted', {
    rowCount: campsiteResult.rowCount,
  });

  // Step 2 – structure assets
  logger.info('Step 2: Inserting structure assets …');
  const structureResult = await client.query(INSERT_STRUCTURE_ASSETS);
  logger.info('Structure assets inserted', {
    rowCount: structureResult.rowCount,
  });

  // Step 3 – repair records
  logger.info('Step 3: Inserting asset repair records …');
  const repairResult = await client.query(INSERT_STRUCTURE_REPAIRS);
  logger.info('Asset repair records inserted', {
    rowCount: repairResult.rowCount,
  });

  if (dryRun) {
    logger.warn('DRY RUN – rolling back all changes');
  }
}

async function main() {
  const { dryRun } = await parseArgs();
  const logger = createLogger(SCRIPT_SOURCE);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await run(client, dryRun, logger);

    if (dryRun) {
      await client.query('ROLLBACK');
    } else {
      await client.query('COMMIT');
      logger.info('Migration committed successfully');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Migration failed – rolled back', {
      error: (err as Error).message,
    });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

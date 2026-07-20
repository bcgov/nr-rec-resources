/**
 * Script to export all Rec Resources with a status of Closed as a JSON array,
 * for import into ACT (advisory generation).
 *
 * Data source:
 *   - rst.recreation_status (status_code = 2 => Closed)
 *     Audit columns map back to FTA's recreation_comment table:
 *       created_by  -> entry_userid
 *       created_at  -> entry_timestamp
 *       updated_by  -> update_userid
 *       updated_at  -> update_timestamp
 *   - rst.recreation_resource_type_view_admin for rec_resource_type_code
 *
 * Usage:
 *   npx tsx src/closures/export-closed-resources.ts [options]
 *
 * Options:
 *   --output <path>   Output file path (default: closed-rec-resources-<date>.json)
 *   --pretty          Pretty-print the JSON output (default: true)
 *
 * Environment variables:
 *   - DATABASE_URL: PostgreSQL connection string (required)
 *   - LOG_LEVEL: Winston log level (default: info)
 */

import { writeFileSync } from 'fs';
import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

const SCRIPT_NAME = 'export-closed-resources';

/** rst.recreation_status.status_code value for "Closed" */
const CLOSED_STATUS_CODE = 2;

interface ClosedResourceExport {
  rec_resource_id: string;
  rec_resource_type_code: string | null;
  closure_comment: string | null;
  entry_userid: string | null;
  entry_timestamp: string | null;
  update_userid: string | null;
  update_timestamp: string | null;
}

const EXPORT_QUERY = `
  select
    rs.rec_resource_id,
    rrtv.rec_resource_type_code,
    rs.comment          as closure_comment,
    rs.created_by       as entry_userid,
    rs.created_at       as entry_timestamp,
    rs.updated_by       as update_userid,
    rs.updated_at       as update_timestamp
  from rst.recreation_status rs
  left join rst.recreation_resource_type_view_admin rrtv
    on rrtv.rec_resource_id = rs.rec_resource_id
  where rs.status_code = $1
  order by rs.rec_resource_id;
`;

function toIsoOrNull(value: Date | string | null): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

async function main(): Promise<void> {
  const logger = createLogger(SCRIPT_NAME);

  const argv = await yargs(hideBin(process.argv))
    .option('output', {
      type: 'string',
      description: 'Output file path for the JSON export',
    })
    .option('pretty', {
      type: 'boolean',
      default: true,
      description: 'Pretty-print the JSON output',
    })
    .help()
    .parseAsync();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const outputPath =
    argv.output ??
    `closed-rec-resources-${new Date().toISOString().slice(0, 10)}.json`;

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    logger.info('Fetching closed rec resources...');

    const { rows } = await pool.query(EXPORT_QUERY, [CLOSED_STATUS_CODE]);

    const records: ClosedResourceExport[] = rows.map((row) => ({
      rec_resource_id: row.rec_resource_id,
      rec_resource_type_code: row.rec_resource_type_code ?? null,
      closure_comment: row.closure_comment ?? null,
      entry_userid: row.entry_userid ?? null,
      entry_timestamp: toIsoOrNull(row.entry_timestamp),
      update_userid: row.update_userid ?? null,
      update_timestamp: toIsoOrNull(row.update_timestamp),
    }));

    const missingType = records.filter((r) => !r.rec_resource_type_code);
    if (missingType.length > 0) {
      logger.warn(
        `${missingType.length} record(s) have no rec_resource_type_code`,
        { recResourceIds: missingType.map((r) => r.rec_resource_id) },
      );
    }

    const json = argv.pretty
      ? JSON.stringify(records, null, 2)
      : JSON.stringify(records);

    writeFileSync(outputPath, json + '\n', 'utf-8');

    logger.info('Export complete', {
      totalRecords: records.length,
      outputPath,
    });
  } catch (error) {
    logger.error('Fatal error during export', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

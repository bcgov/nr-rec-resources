/**
 * Compares a CSV header against the column order of its fta mirror table.
 *
 * aws_s3.table_import_from_s3 with an empty column list is positional: HEADER
 * true only skips the first line, it does not match names. A column added to
 * one side and not the other silently loads every value into the wrong column.
 *
 * Usage:
 *   npx tsx src/fta-notes/check-csv-columns.ts --csv <path> --table fta.provforest_note
 *
 * Environment variables:
 *   - DATABASE_URL: PostgreSQL connection string (required)
 */

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

const SYNC_SOURCE = 'check-csv-columns';

function readHeader(path: string): string[] {
  const content = fs.readFileSync(path, 'utf8');
  const [header] = parse(content, { to_line: 1 }) as string[][];
  return header.map((c) => c.trim().toLowerCase());
}

async function main(): Promise<void> {
  const logger = createLogger(SYNC_SOURCE);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const args = await yargs(hideBin(process.argv))
    .option('csv', {
      type: 'string',
      demandOption: true,
      description: 'Path to the CSV',
    })
    .option('table', {
      type: 'string',
      demandOption: true,
      description: 'Qualified table name, e.g. fta.provforest_note',
    })
    .help()
    .parseAsync();

  const [schema, table] = args.table.split('.');
  if (!schema || !table) {
    logger.error('Table must be schema qualified, e.g. fta.provforest_note');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const { rows } = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
        where table_schema = $1 and table_name = $2
        order by ordinal_position`,
      [schema, table],
    );

    if (rows.length === 0) {
      logger.error('Table not found', { table: args.table });
      process.exit(1);
    }

    const csvColumns = readHeader(args.csv);
    const tableColumns = rows.map((r) => r.column_name);

    let matched = true;
    const length = Math.max(csvColumns.length, tableColumns.length);

    for (let i = 0; i < length; i++) {
      const csvColumn = csvColumns[i];
      const tableColumn = tableColumns[i];
      if (csvColumn === tableColumn) continue;

      matched = false;
      logger.error('Column mismatch', {
        position: i + 1,
        csv: csvColumn ?? '(missing)',
        table: tableColumn ?? '(missing)',
      });
    }

    if (!matched) {
      logger.error(
        'CSV and table disagree, the import would load wrong values',
        {
          csvColumns: csvColumns.length,
          tableColumns: tableColumns.length,
        },
      );
      process.exit(1);
    }

    logger.info('CSV header matches table column order', {
      table: args.table,
      columns: tableColumns.length,
    });
  } finally {
    await pool.end();
  }
}

main();

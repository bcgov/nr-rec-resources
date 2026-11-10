/**
 * Imports historical notes from the FTA CSV extracts into
 * rst.recreation_resource_note. Safe to re-run.
 *
 * Usage:
 *   npx tsx src/fta-notes/import-fta-notes.ts --notes-csv <path> --assoc-csv <path>
 *
 * Environment variables:
 *   - DATABASE_URL: PostgreSQL connection string (required)
 *   - LOG_LEVEL: Winston log level (default: info)
 */

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger, Logger } from '../logger';

const SYNC_SOURCE = 'import-fta-notes';

/** Marks imported rows, which are read-only in the admin app. */
const SOURCE_SYSTEM = 'FTA';

/** The 2005 data migration account. Its rows are generated summaries, not real notes. */
const CONVERSION_USER = 'RECREATION_CONVERSION';

/** Only recreation files reach rst. */
const REC_FILE_PREFIX = 'REC';

const NOTE_TYPE_CODE = 'NOTE';

/** Rows per multi-value insert. Postgres caps a statement at 65535 parameters. */
const INSERT_CHUNK_SIZE = 500;

interface ParsedArgs {
  notesCsv: string;
  assocCsv: string;
  dryRun: boolean;
  clean: boolean;
}

interface NoteRow {
  recResourceId: string;
  title: string;
  /** Plain text. The database escapes it and converts the line breaks. */
  bodyText: string;
  /** Raw YY-MM-DD. The database pivots the century. */
  entryTimestamp: string;
  sourceKey: string;
  createdBy: string;
}

interface SkipCounts {
  notRecFile: number;
  conversionAccount: number;
  noMatchingResource: number;
}

const emptySkips = (): SkipCounts => ({
  notRecFile: 0,
  conversionAccount: 0,
  noMatchingResource: 0,
});

type CsvRow = Record<string, string>;

function readCsv(path: string): CsvRow[] {
  const content = fs.readFileSync(path, 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as CsvRow[];
}

class FtaNoteImporter {
  private readonly logger: Logger;
  private readonly pool: Pool;

  constructor(logger: Logger, pool: Pool) {
    this.logger = logger;
    this.pool = pool;
  }

  /** Used to drop rows whose file id never became a recreation resource. */
  private async loadResourceIds(): Promise<Set<string>> {
    const { rows } = await this.pool.query<{ rec_resource_id: string }>(
      'select rec_resource_id from rst.recreation_resource',
    );
    return new Set(rows.map((r) => r.rec_resource_id));
  }

  /** Descriptions for the ASSOCIATED_USE source letters. */
  private async loadFileSourceDescriptions(): Promise<Map<string, string>> {
    const { rows } = await this.pool.query<{
      file_source_code: string;
      description: string;
    }>(
      'select file_source_code, description from rst.recreation_file_source_code',
    );
    return new Map(rows.map((r) => [r.file_source_code, r.description]));
  }

  private isExcluded(row: CsvRow, skips: SkipCounts): boolean {
    if (!row.FOREST_FILE_ID?.startsWith(REC_FILE_PREFIX)) {
      skips.notRecFile++;
      return true;
    }
    if (
      row.ENTRY_USERID === CONVERSION_USER ||
      row.UPDATE_USERID === CONVERSION_USER
    ) {
      skips.conversionAccount++;
      return true;
    }
    return false;
  }

  private mapNotes(
    rows: CsvRow[],
    resourceIds: Set<string>,
    skips: SkipCounts,
  ): NoteRow[] {
    const mapped: NoteRow[] = [];

    for (const row of rows) {
      if (this.isExcluded(row, skips)) continue;

      if (!resourceIds.has(row.FOREST_FILE_ID)) {
        skips.noMatchingResource++;
        continue;
      }

      mapped.push({
        recResourceId: row.FOREST_FILE_ID,
        title: 'FTA Note',
        bodyText: row.NOTE ?? '',
        entryTimestamp: row.ENTRY_TIMESTAMP,
        sourceKey: row.PROVFOREST_NOTE_SKEY,
        createdBy: row.ENTRY_USERID,
      });
    }

    return mapped;
  }

  /**
   * Associations have no surrogate key, so the file id, source code and
   * associated file id together make up source_key.
   */
  private mapAssociations(
    rows: CsvRow[],
    resourceIds: Set<string>,
    sourceDescriptions: Map<string, string>,
    skips: SkipCounts,
  ): NoteRow[] {
    const mapped: NoteRow[] = [];

    for (const row of rows) {
      if (this.isExcluded(row, skips)) continue;

      if (!resourceIds.has(row.FOREST_FILE_ID)) {
        skips.noMatchingResource++;
        continue;
      }

      const code = row.FILE_SOURCE_CODE;
      const description = sourceDescriptions.get(code) ?? code;

      mapped.push({
        recResourceId: row.FOREST_FILE_ID,
        title: `FTA Associated File - ${description}`,
        bodyText: [
          `Source file ID: ${row.FOREST_FILE_ID}`,
          `Associated file ID: ${row.ASSOCIATED_FILE_ID}`,
          `File source: ${description} (${code})`,
        ].join('\n'),
        entryTimestamp: row.ENTRY_TIMESTAMP,
        sourceKey: `${row.FOREST_FILE_ID}|${code}|${row.ASSOCIATED_FILE_ID}`,
        createdBy: row.ENTRY_USERID,
      });
    }

    return mapped;
  }

  /**
   * Returns the number of rows written. The rest were already imported.
   * The conflict target repeats the index predicate because it is partial.
   */
  private async insertChunk(rows: NoteRow[]): Promise<number> {
    const values: string[] = [];
    const params: string[] = [];

    rows.forEach((row, index) => {
      const base = index * 6;
      values.push(
        `($${base + 1}, '${NOTE_TYPE_CODE}', $${base + 2},` +
          ` rst.fta_note_to_html($${base + 3}),` +
          ` rst.fta_note_pivot_date($${base + 4}),` +
          ` '${SOURCE_SYSTEM}', $${base + 5}, $${base + 6})`,
      );
      params.push(
        row.recResourceId,
        row.title,
        row.bodyText,
        row.entryTimestamp,
        row.sourceKey,
        row.createdBy,
      );
    });

    const result = await this.pool.query(
      `insert into rst.recreation_resource_note (
         rec_resource_id, note_type_code, title, body,
         date_logged, source_system, source_key, created_by
       ) values ${values.join(', ')}
       on conflict (source_system, source_key) where source_key is not null
       do nothing`,
      params,
    );

    return result.rowCount ?? 0;
  }

  private async insertAll(rows: NoteRow[], label: string): Promise<number> {
    let inserted = 0;

    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + INSERT_CHUNK_SIZE);
      inserted += await this.insertChunk(chunk);
      this.logger.debug(`Wrote ${label} chunk`, {
        from: i,
        size: chunk.length,
      });
    }

    return inserted;
  }

  async run(args: ParsedArgs): Promise<void> {
    const [resourceIds, sourceDescriptions] = await Promise.all([
      this.loadResourceIds(),
      this.loadFileSourceDescriptions(),
    ]);

    this.logger.info('Loaded reference data', {
      recreationResources: resourceIds.size,
      fileSourceCodes: sourceDescriptions.size,
    });

    const noteCsv = readCsv(args.notesCsv);
    const assocCsv = readCsv(args.assocCsv);

    this.logger.info('Read CSV extracts', {
      provforestNoteRows: noteCsv.length,
      associatedUseRows: assocCsv.length,
    });

    const noteSkips = emptySkips();
    const assocSkips = emptySkips();
    const notes = this.mapNotes(noteCsv, resourceIds, noteSkips);
    const associations = this.mapAssociations(
      assocCsv,
      resourceIds,
      sourceDescriptions,
      assocSkips,
    );

    this.logger.info('PROVFOREST_NOTE after filtering', {
      eligible: notes.length,
      skippedNotRecFile: noteSkips.notRecFile,
      skippedConversionAccount: noteSkips.conversionAccount,
      skippedNoMatchingResource: noteSkips.noMatchingResource,
    });
    this.logger.info('ASSOCIATED_USE after filtering', {
      eligible: associations.length,
      skippedNotRecFile: assocSkips.notRecFile,
      skippedConversionAccount: assocSkips.conversionAccount,
      skippedNoMatchingResource: assocSkips.noMatchingResource,
    });

    if (args.dryRun) {
      this.logger.info('Dry run, nothing written', {
        wouldInsert: notes.length + associations.length,
      });
      return;
    }

    const insertedNotes = await this.insertAll(notes, 'note');
    const insertedAssociations = await this.insertAll(
      associations,
      'association',
    );

    this.logger.info('Import complete', {
      insertedNotes,
      insertedAssociations,
      alreadyPresent:
        notes.length -
        insertedNotes +
        (associations.length - insertedAssociations),
    });
  }
}

async function parseArgs(): Promise<ParsedArgs> {
  const parsed = await yargs(hideBin(process.argv))
    .option('notes-csv', {
      type: 'string',
      demandOption: true,
      description: 'Path to PROVFOREST_NOTE.csv',
    })
    .option('assoc-csv', {
      type: 'string',
      demandOption: true,
      description: 'Path to ASSOCIATED_USE.csv',
    })
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description:
        'Read and filter the extracts without writing to the database',
    })
    .option('clean', {
      type: 'boolean',
      default: false,
      description:
        'Delete every FTA-sourced note before importing (full refresh)',
    })
    .help()
    .parseAsync();

  return {
    notesCsv: parsed['notes-csv'] as string,
    assocCsv: parsed['assoc-csv'] as string,
    dryRun: parsed['dry-run'] as boolean,
    clean: parsed.clean as boolean,
  };
}

async function main(): Promise<void> {
  const logger = createLogger(SYNC_SOURCE);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const args = await parseArgs();

  for (const path of [args.notesCsv, args.assocCsv]) {
    if (!fs.existsSync(path)) {
      logger.error('CSV not found', { path });
      process.exit(1);
    }
  }

  const pool = new Pool({ connectionString: databaseUrl });

  await pool.query('SET search_path TO rst, public;');

  try {
    logger.info('Starting FTA note import', {
      notesCsv: args.notesCsv,
      assocCsv: args.assocCsv,
      dryRun: args.dryRun,
      clean: args.clean,
    });

    if (args.clean && !args.dryRun) {
      logger.warn(
        '--clean flag set: deleting all FTA-sourced notes before importing',
      );
      const deleted = await pool.query(
        'delete from rst.recreation_resource_note where source_system = $1',
        [SOURCE_SYSTEM],
      );
      logger.info('Deleted existing imported notes', {
        rows: deleted.rowCount ?? 0,
      });
    }

    const importer = new FtaNoteImporter(logger, pool);
    await importer.run(args);

    logger.info('FTA note import completed successfully');
  } catch (error) {
    logger.error('Fatal error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

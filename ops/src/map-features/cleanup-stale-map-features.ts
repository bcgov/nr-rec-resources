/**
 * Deletes rst.recreation_map_feature rows the fta sync can no longer reach.
 * Everything runs in one transaction, so a failed check leaves nothing behind.
 * Safe to re-run.
 *
 * Two populations, both pure deletes:
 *
 *   1. Duplicate polygon rows. Polygons carry a null section_id and the old
 *      upsert in V1.1.11 arbitrated on (rec_resource_id, section_id), which
 *      never fires for nulls, so every amendment piled on another row instead
 *      of updating the one we had. Highest rmf_skey is the live one, checked
 *      against the bcgw polygon layer and it held for all 72 slots.
 *
 *   2. REC4735's orphan lines. Its sections were renamed from numbers to names
 *      under fresh skeys, so these sit in slots fta stopped reporting and
 *      nothing matches them. Listed by skey because it is the only resource
 *      like this.
 *
 * Usage:
 *   npx tsx src/map-features/cleanup-stale-map-features.ts --dry-run
 *   npx tsx src/map-features/cleanup-stale-map-features.ts
 *
 * Environment variables:
 *   - DATABASE_URL: PostgreSQL connection string (required unless --database-url)
 *   - LOG_LEVEL: Winston log level (default: info)
 */

import { Pool, PoolClient } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger, Logger } from '../logger';

const SCRIPT_NAME = 'cleanup-stale-map-features';

/** The only resource whose sections were renamed, leaving unreachable rows. */
const ORPHAN_RESOURCE_ID = 'REC4735';
const ORPHAN_SKEY_MIN = 261861;
const ORPHAN_SKEY_MAX = 261868;

/** What the investigation found. A different number means prod has moved on. */
const EXPECTED_ORPHAN_ROWS = 8;

interface ParsedArgs {
  dryRun: boolean;
  databaseUrl?: string;
}

interface PopulationSummary {
  rows: number;
  resources: number;
  sample: string[];
}

/** Raised when a check fails, so main() can roll back and exit non-zero. */
class CheckFailedError extends Error {}

/** Not a failure. Unwinds the transaction once the dry run has reported. */
class DryRunRollback extends Error {}

class StaleMapFeatureCleaner {
  private readonly logger: Logger;
  private readonly client: PoolClient;

  constructor(logger: Logger, client: PoolClient) {
    this.logger = logger;
    this.client = client;
  }

  /**
   * Both target sets go into temp tables up front so the preview and the delete
   * can never disagree about which rows are in scope.
   */
  private async collectTargets(): Promise<void> {
    await this.client.query(`
      create temp table dupe_targets on commit drop as
      select rmf_skey, rec_resource_id
      from (
          select rmf_skey, rec_resource_id,
                 row_number() over (
                     partition by rec_resource_id, section_id
                     order by rmf_skey desc
                 ) as rn
          from rst.recreation_map_feature
          where section_id is null
      ) ranked
      where rn > 1
    `);

    await this.client.query(
      `
      create temp table orphan_targets on commit drop as
      select rmf_skey, rec_resource_id
      from rst.recreation_map_feature
      where rec_resource_id = $1
        and rmf_skey between $2 and $3
    `,
      [ORPHAN_RESOURCE_ID, ORPHAN_SKEY_MIN, ORPHAN_SKEY_MAX],
    );
  }

  private async summarize(table: string): Promise<PopulationSummary> {
    const { rows } = await this.client.query<{
      rows: string;
      resources: string;
      sample: string[] | null;
    }>(`
      select count(*)::text as rows,
             count(distinct rec_resource_id)::text as resources,
             (array_agg(distinct rec_resource_id))[1:5] as sample
      from ${table}
    `);

    return {
      rows: Number(rows[0].rows),
      resources: Number(rows[0].resources),
      sample: rows[0].sample ?? [],
    };
  }

  /**
   * A surviving row with no geometry would drop out of both bcgw layers, since
   * the views join geometry and then filter on geometry_type_code.
   */
  private async checkSurvivorsHaveGeometry(): Promise<void> {
    const { rows } = await this.client.query<{ missing: string }>(`
      with dup_slots as (
          select rec_resource_id, section_id
          from rst.recreation_map_feature
          where section_id is null
          group by rec_resource_id, section_id
          having count(*) > 1
      ),
      survivors as (
          select distinct on (f.rec_resource_id, f.section_id) f.rmf_skey
          from rst.recreation_map_feature f
          join dup_slots d
            on d.rec_resource_id = f.rec_resource_id
           and d.section_id is not distinct from f.section_id
          order by f.rec_resource_id, f.section_id, f.rmf_skey desc
      )
      select count(*)::text as missing
      from survivors s
      where not exists (
          select 1 from rst.recreation_map_feature_geom g
          where g.rmf_skey = s.rmf_skey
      )
    `);

    const missing = Number(rows[0].missing);
    if (missing > 0) {
      throw new CheckFailedError(
        `${missing} surviving polygon rows have no geometry, they would vanish from the layers`,
      );
    }
    this.logger.info('Every surviving polygon row has geometry');
  }

  /** V1.1.110 made this fk on delete set null, so the link goes quietly. */
  private async countAffectedSubmissionLinks(): Promise<number> {
    const { rows } = await this.client.query<{ links: string }>(`
      select count(*)::text as links
      from rst.recreation_spatial_submission_map_feature s
      where s.rmf_skey in (select rmf_skey from dupe_targets)
         or s.rmf_skey in (select rmf_skey from orphan_targets)
    `);
    return Number(rows[0].links);
  }

  /** Geometry goes first, its fk has no on delete. */
  private async deleteTargets(): Promise<number> {
    const result = await this.client.query(`
      with targets as (
          select rmf_skey from dupe_targets
          union all
          select rmf_skey from orphan_targets
      ),
      deleted_geom as (
          delete from rst.recreation_map_feature_geom
          where rmf_skey in (select rmf_skey from targets)
          returning rmf_skey
      )
      delete from rst.recreation_map_feature
      where rmf_skey in (select rmf_skey from targets)
    `);
    return result.rowCount ?? 0;
  }

  private async verify(): Promise<void> {
    const { rows } = await this.client.query<{
      remaining_dupe_slots: string;
      remaining_orphans: string;
      orphan_resource_rows: string;
      orphan_geometry: string;
    }>(
      `
      select
        (select count(*)::text from (
            select 1 from rst.recreation_map_feature
            where section_id is null
            group by rec_resource_id, section_id
            having count(*) > 1
        ) s) as remaining_dupe_slots,
        (select count(*)::text from rst.recreation_map_feature
         where rec_resource_id = $1 and rmf_skey between $2 and $3
        ) as remaining_orphans,
        (select count(*)::text from rst.recreation_map_feature
         where rec_resource_id = $1
        ) as orphan_resource_rows,
        (select count(*)::text from rst.recreation_map_feature_geom g
         where not exists (
             select 1 from rst.recreation_map_feature f where f.rmf_skey = g.rmf_skey
         )
        ) as orphan_geometry
    `,
      [ORPHAN_RESOURCE_ID, ORPHAN_SKEY_MIN, ORPHAN_SKEY_MAX],
    );

    const checks = rows[0];
    this.logger.info('Post-delete checks', { ...checks });

    if (Number(checks.remaining_dupe_slots) > 0) {
      throw new CheckFailedError(
        `${checks.remaining_dupe_slots} null-section slots still hold more than one row`,
      );
    }
    if (Number(checks.remaining_orphans) > 0) {
      throw new CheckFailedError(
        `${ORPHAN_RESOURCE_ID} still has ${checks.remaining_orphans} rows in the orphan skey range`,
      );
    }
    if (Number(checks.orphan_resource_rows) === 0) {
      throw new CheckFailedError(
        `${ORPHAN_RESOURCE_ID} has no rows left, expected its current features to survive`,
      );
    }
    if (Number(checks.orphan_geometry) > 0) {
      throw new CheckFailedError(
        `${checks.orphan_geometry} geometry rows left without a map feature`,
      );
    }
  }

  async run(args: ParsedArgs): Promise<void> {
    await this.collectTargets();

    const duplicates = await this.summarize('dupe_targets');
    const orphans = await this.summarize('orphan_targets');

    this.logger.info('Duplicate polygon rows to delete', {
      rows: duplicates.rows,
      resources: duplicates.resources,
      sample: duplicates.sample.join(','),
    });
    this.logger.info('Orphan line rows to delete', {
      rows: orphans.rows,
      resources: orphans.resources,
      expected: EXPECTED_ORPHAN_ROWS,
    });

    if (orphans.rows !== EXPECTED_ORPHAN_ROWS) {
      this.logger.warn(
        'Orphan row count differs from the investigation, check before committing',
        { found: orphans.rows, expected: EXPECTED_ORPHAN_ROWS },
      );
    }

    const total = duplicates.rows + orphans.rows;
    if (total === 0) {
      this.logger.info('Nothing to delete, already clean');
      return;
    }

    await this.checkSurvivorsHaveGeometry();

    const links = await this.countAffectedSubmissionLinks();
    if (links > 0) {
      this.logger.warn('Spatial submission links will be set to null', {
        links,
      });
    } else {
      this.logger.info('No spatial submission links point at these rows');
    }

    const deleted = await this.deleteTargets();
    this.logger.info('Deleted map feature rows', { deleted, expected: total });

    if (deleted !== total) {
      throw new CheckFailedError(
        `deleted ${deleted} rows but targeted ${total}`,
      );
    }

    await this.verify();

    const { rows } = await this.client.query<{
      polygon_rows: string;
      line_rows: string;
      total: string;
    }>(`
      select count(*) filter (where section_id is null)::text as polygon_rows,
             count(*) filter (where section_id is not null)::text as line_rows,
             count(*)::text as total
      from rst.recreation_map_feature
    `);
    this.logger.info('Map feature table after cleanup', { ...rows[0] });

    if (args.dryRun) {
      throw new DryRunRollback();
    }
  }
}

async function parseArgs(): Promise<ParsedArgs> {
  const parsed = await yargs(hideBin(process.argv))
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Run every check and roll back instead of committing',
    })
    .option('database-url', {
      type: 'string',
      description: 'Connection string, overrides DATABASE_URL',
    })
    .help()
    .parseAsync();

  return {
    dryRun: parsed['dry-run'] as boolean,
    databaseUrl: parsed['database-url'] as string | undefined,
  };
}

async function main(): Promise<void> {
  const logger = createLogger(SCRIPT_NAME);
  const args = await parseArgs();

  const databaseUrl = args.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('Pass --database-url or set DATABASE_URL');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    logger.info('Starting map feature cleanup', { dryRun: args.dryRun });

    await client.query('BEGIN');
    const cleaner = new StaleMapFeatureCleaner(logger, client);

    try {
      await cleaner.run(args);
      await client.query('COMMIT');
      logger.info('Committed');
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof DryRunRollback) {
        logger.info('Dry run, rolled back. Re-run without --dry-run to apply');
        return;
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof CheckFailedError) {
      logger.error('Check failed, nothing was committed', {
        error: error.message,
      });
    } else {
      logger.error('Fatal error, nothing was committed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();

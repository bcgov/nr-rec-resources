/**
 * Script to fetch advisories from the Advisories API
 * and populate the act_advisories_flat table in the RST database.
 *
 * Usage:
 *   npx tsx src/advisories/sync-advisories.ts [options]
 *
 * Environment variables:
 *   - DATABASE_URL: PostgreSQL connection string (required)
 *   - API_BASE_URL: Base URL for the CMS API (required)
 *   - API_TOKEN: Bearer token for API authentication (required)
 *   - LOG_LEVEL: Winston log level (default: info)
 */

import { Pool } from 'pg';
import { create as axiosCreate } from 'axios';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger, Logger } from '../logger';

/**
 * Identifier written to the `created_by` / `updated_by` audit columns
 * so we can tell which job inserted/updated each row.
 */
const SYNC_SOURCE = 'sync-advisories';

interface ParsedArgs {
  dryRun: boolean;
  pageSize: number;
  maxPages?: number;
  concurrency: number;
  apiBaseUrl?: string;
  apiToken?: string;
}

interface AdvisoryData {
  advisoryNumber: number;
  title: string;
  description?: string;
  advisoryDate: string;
  effectiveDate: string;
  endDate?: string;
  expiryDate?: string;
  updatedDate?: string;
  publishedAt?: string;
  submittedByName?: string;
  isReservationsAffected: boolean;
  isAdvisoryDateDisplayed: boolean;
  isEffectiveDateDisplayed: boolean;
  isEndDateDisplayed: boolean;
  isUpdatedDateDisplayed: boolean;
  listingRank: number;
  accessStatus?: {
    accessStatus: string;
    groupLabel: string;
    description?: string;
    precedence: number;
  };
  eventType?: {
    eventType: string;
    precedence: number;
  };
  urgency?: {
    urgency: string;
    sequence: number;
  };
  advisoryStatus?: {
    advisoryStatus: string;
  };
  recreationResources?: Array<{
    recResourceId: string;
  }>;
}

interface ApiResponse {
  data: AdvisoryData[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

class AdvisorySync {
  private logger: Logger;
  private pool: Pool;
  private axiosInstance;

  constructor(
    logger: Logger,
    pool: Pool,
    apiBaseUrl: string,
    apiToken?: string,
  ) {
    this.logger = logger;
    this.pool = pool;
    this.axiosInstance = axiosCreate({
      baseURL: apiBaseUrl,
      timeout: 30000,
      headers: {
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
    });
  }

  /**
   * Build the Strapi API URL with all the required query parameters.
   * Strapi accepts the bracket-style query string directly, so we keep it
   * as a readable template literal instead of building it via URLSearchParams.
   * Only `page` and `pageSize` are dynamic.
   */
  private buildApiUrl(page: number, pageSize: number): string {
    return (
      `/api/public-advisory-audits` +
      `?filters[recreationResources][recResourceId][$notNull]=true` +
      `&filters[isLatestRevision][$eq]=true` +
      `&filters[advisoryStatus][advisoryStatus][$in][0]=Published` +
      `&filters[advisoryStatus][advisoryStatus][$in][1]=Scheduled` +
      `&fields[0]=advisoryNumber` +
      `&fields[1]=title` +
      `&fields[2]=description` +
      `&fields[3]=advisoryDate` +
      `&fields[4]=effectiveDate` +
      `&fields[5]=endDate` +
      `&fields[6]=expiryDate` +
      `&fields[7]=updatedDate` +
      `&fields[8]=publishedAt` +
      `&fields[9]=isReservationsAffected` +
      `&fields[10]=isAdvisoryDateDisplayed` +
      `&fields[11]=isEffectiveDateDisplayed` +
      `&fields[12]=isEndDateDisplayed` +
      `&fields[13]=isUpdatedDateDisplayed` +
      `&fields[14]=listingRank` +
      `&fields[15]=submittedByName` +
      `&fields[16]=isLatestRevision` +
      `&populate[accessStatus][fields][0]=accessStatus` +
      `&populate[accessStatus][fields][1]=groupLabel` +
      `&populate[accessStatus][fields][2]=description` +
      `&populate[accessStatus][fields][3]=precedence` +
      `&populate[eventType][fields][0]=eventType` +
      `&populate[eventType][fields][1]=precedence` +
      `&populate[urgency][fields][0]=urgency` +
      `&populate[urgency][fields][1]=sequence` +
      `&populate[advisoryStatus][fields][0]=advisoryStatus` +
      `&populate[recreationResources][fields][0]=recResourceId` +
      `&pagination[page]=${page}` +
      `&pagination[pageSize]=${pageSize}`
    );
  }

  /**
   * Fetch advisories from the API
   */
  async fetchAdvisories(page: number, pageSize: number): Promise<ApiResponse> {
    try {
      const url = this.buildApiUrl(page, pageSize);
      this.logger.debug(`Fetching from ${url}`);
      const response = await this.axiosInstance.get<ApiResponse>(url);

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch advisories', {
        error: error instanceof Error ? error.message : String(error),
        page,
        pageSize,
      });
      throw error;
    }
  }

  /**
   * Insert or update an advisory in the database
   * Uses UPSERT (ON CONFLICT) to handle existing advisories
   */
  async syncAdvisory(
    advisory: AdvisoryData,
    recResourceId: string,
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO rst.act_advisories_flat (
          rec_resource_id, advisory_number, title, description, submitted_by,
          access_status_name, access_status_grouplabel, access_status_description,
          event_type, urgency, advisory_status,
          is_reservations_affected, is_advisory_date_displayed, is_effective_date_displayed,
          is_end_date_displayed, is_updated_date_displayed,
          advisory_date, effective_date, end_date, expiry_date,
          updated_date, published_at,
          listing_rank, urgency_sequence, access_status_precedence, event_type_precedence,
          created_by, updated_by
        ) VALUES (
                   $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                   $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
                 )
          ON CONFLICT (rec_resource_id, advisory_number) DO UPDATE SET
          title = EXCLUDED.title,
                                                              description = EXCLUDED.description,
                                                              submitted_by = EXCLUDED.submitted_by,
                                                              access_status_name = EXCLUDED.access_status_name,
                                                              access_status_grouplabel = EXCLUDED.access_status_grouplabel,
                                                              access_status_description = EXCLUDED.access_status_description,
                                                              event_type = EXCLUDED.event_type,
                                                              urgency = EXCLUDED.urgency,
                                                              advisory_status = EXCLUDED.advisory_status,
                                                              is_reservations_affected = EXCLUDED.is_reservations_affected,
                                                              is_advisory_date_displayed = EXCLUDED.is_advisory_date_displayed,
                                                              is_effective_date_displayed = EXCLUDED.is_effective_date_displayed,
                                                              is_end_date_displayed = EXCLUDED.is_end_date_displayed,
                                                              is_updated_date_displayed = EXCLUDED.is_updated_date_displayed,
                                                              advisory_date = EXCLUDED.advisory_date,
                                                              effective_date = EXCLUDED.effective_date,
                                                              end_date = EXCLUDED.end_date,
                                                              expiry_date = EXCLUDED.expiry_date,
                                                              updated_date = EXCLUDED.updated_date,
                                                              published_at = EXCLUDED.published_at,
                                                              listing_rank = EXCLUDED.listing_rank,
                                                              urgency_sequence = EXCLUDED.urgency_sequence,
                                                              access_status_precedence = EXCLUDED.access_status_precedence,
                                                              event_type_precedence = EXCLUDED.event_type_precedence,
                                                              updated_at = now(),
                                                              updated_by = EXCLUDED.updated_by;
        -- NOTE: created_at and created_by are intentionally NOT in the ON CONFLICT
        -- UPDATE SET so the original insert metadata is preserved on re-syncs.
      `;

      const values = [
        recResourceId,
        advisory.advisoryNumber,
        advisory.title,
        advisory.description || null,
        advisory.submittedByName || null,
        advisory.accessStatus?.accessStatus || 'Unknown',
        advisory.accessStatus?.groupLabel || 'Unknown',
        advisory.accessStatus?.description || null,
        advisory.eventType?.eventType || 'Unknown',
        advisory.urgency?.urgency || 'Unknown',
        advisory.advisoryStatus?.advisoryStatus || 'Unknown',
        advisory.isReservationsAffected ?? false,
        advisory.isAdvisoryDateDisplayed ?? false,
        advisory.isEffectiveDateDisplayed ?? false,
        advisory.isEndDateDisplayed ?? false,
        advisory.isUpdatedDateDisplayed ?? false,
        new Date(advisory.advisoryDate),
        new Date(advisory.effectiveDate),
        advisory.endDate ? new Date(advisory.endDate) : null,
        advisory.expiryDate ? new Date(advisory.expiryDate) : null,
        advisory.updatedDate ? new Date(advisory.updatedDate) : null,
        advisory.publishedAt ? new Date(advisory.publishedAt) : null,
        advisory.listingRank,
        advisory.urgency?.sequence || 0,
        advisory.accessStatus?.precedence || 0,
        advisory.eventType?.precedence || 0,
        SYNC_SOURCE, // created_by
        SYNC_SOURCE, // updated_by
      ];

      // 🔴 ACTUAL DATABASE WRITE: Insert/update advisory record to rst.act_advisories_flat table
      await this.pool.query(query, values);
    } catch (error) {
      this.logger.error('Failed to sync advisory', {
        error: error instanceof Error ? error.message : String(error),
        recResourceId,
        advisoryNumber: advisory.advisoryNumber,
      });
      throw error;
    }
  }

  /**
   * Main sync process
   * Fetches advisories page-by-page and syncs them with controlled concurrency
   */
  async sync(args: ParsedArgs): Promise<void> {
    let totalProcessed = 0;
    let currentPage = 1;
    let totalPages = 1;
    const maxPagesToProcess = args.maxPages || Infinity;

    while (currentPage <= totalPages && currentPage <= maxPagesToProcess) {
      try {
        this.logger.info(`Fetching page ${currentPage}/${totalPages}`);

        const response = await this.fetchAdvisories(currentPage, args.pageSize);

        // Extract pagination info from API response (supports multiple formats)
        const paginationInfo = response.meta?.pagination || response.pagination;

        if (paginationInfo) {
          totalPages =
            (paginationInfo as any).pageCount ||
            Math.ceil(paginationInfo.total / args.pageSize);
          this.logger.info(
            `Total: ${paginationInfo.total}, Pages: ${totalPages}`,
          );
        } else {
          totalPages = 1;
          this.logger.warn('No pagination info in response');
        }

        // Flatten advisories by recreation resource (one advisory can apply to multiple resources)
        const advisoriesToSync = this.flattenAdvisories(response.data);

        if (advisoriesToSync.length === 0) {
          this.logger.info(`Page ${currentPage}: No advisories to process`);
          currentPage++;
          continue;
        }

        this.logger.info(
          `Processing ${advisoriesToSync.length} advisory records on page ${currentPage}`,
        );

        // Process advisories with controlled concurrency using batch processing
        await this.processConcurrentBatch(advisoriesToSync, args);

        totalProcessed += advisoriesToSync.length;
        this.logger.info(
          `Completed page ${currentPage} (Total: ${totalProcessed})`,
        );

        currentPage++;
      } catch (error) {
        this.logger.error('Fatal error during sync', {
          error: error instanceof Error ? error.message : String(error),
          page: currentPage,
        });
        throw error;
      }
    }

    this.logger.info('Sync completed', { totalProcessed });
  }

  /**
   * Flatten advisories by recreation resource
   * Since one advisory can be linked to multiple resources, create an entry per resource
   */
  private flattenAdvisories(
    advisories: AdvisoryData[],
  ): Array<{ advisory: AdvisoryData; recResourceId: string }> {
    const flattened: Array<{ advisory: AdvisoryData; recResourceId: string }> =
      [];

    for (const advisory of advisories) {
      if (advisory.recreationResources?.length) {
        for (const rec of advisory.recreationResources) {
          flattened.push({ advisory, recResourceId: rec.recResourceId });
        }
      }
    }

    return flattened;
  }

  /**
   * Process advisories in concurrent batches to limit database load
   * Uses Promise.allSettled for robust batch processing
   */
  private async processConcurrentBatch(
    advisoriesToSync: Array<{ advisory: AdvisoryData; recResourceId: string }>,
    args: ParsedArgs,
  ): Promise<void> {
    for (let i = 0; i < advisoriesToSync.length; i += args.concurrency) {
      const batch = advisoriesToSync.slice(i, i + args.concurrency);

      const promises = batch.map(({ advisory, recResourceId }) =>
        this.syncAdvisoryWithErrorHandling(
          advisory,
          recResourceId,
          args.dryRun,
        ),
      );

      await Promise.allSettled(promises);
    }
  }

  /**
   * Sync advisory with error handling
   */
  private async syncAdvisoryWithErrorHandling(
    advisory: AdvisoryData,
    recResourceId: string,
    dryRun: boolean,
  ): Promise<void> {
    try {
      if (!dryRun) {
        await this.syncAdvisory(advisory, recResourceId);
      } else {
        this.logger.debug('Dry run: would sync advisory', {
          recResourceId,
          advisoryNumber: advisory.advisoryNumber,
        });
      }
    } catch (error) {
      this.logger.error('Error syncing advisory', {
        error: error instanceof Error ? error.message : String(error),
        recResourceId,
        advisoryNumber: advisory.advisoryNumber,
      });
    }
  }
}

async function parseArgs(): Promise<ParsedArgs> {
  const parsed = await yargs(hideBin(process.argv))
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Fetch and validate data without writing to database',
    })
    .option('page-size', {
      type: 'number',
      default: 100,
      description: 'Number of advisories per API page',
    })
    .option('max-pages', {
      type: 'number',
      description: 'Maximum number of pages to fetch (useful for testing)',
    })
    .option('concurrency', {
      type: 'number',
      default: 5,
      description: 'Number of concurrent database writes',
    })
    .option('api-base-url', {
      type: 'string',
      description: 'Base URL for the CMS API',
    })
    .option('api-token', {
      type: 'string',
      description: 'Bearer token for API authentication',
    })
    .help()
    .parseAsync();

  return {
    dryRun: parsed['dry-run'] as boolean,
    pageSize: parsed['page-size'] as number,
    maxPages: parsed['max-pages'] as number | undefined,
    concurrency: parsed.concurrency as number,
    apiBaseUrl: parsed['api-base-url'] as string | undefined,
    apiToken: parsed['api-token'] as string | undefined,
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

  const apiBaseUrl = args.apiBaseUrl || process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    logger.error(
      'API_BASE_URL is required. Provide via --api-base-url flag or API_BASE_URL env var',
    );
    process.exit(1);
  }

  const apiToken = args.apiToken || process.env.API_TOKEN || undefined;

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  await pool.query('SET search_path TO rst, public;');

  try {
    logger.info('Starting advisory sync', {
      dryRun: args.dryRun,
      pageSize: args.pageSize,
      maxPages: args.maxPages || 'unlimited',
      concurrency: args.concurrency,
      apiBaseUrl,
    });

    const syncer = new AdvisorySync(logger, pool, apiBaseUrl, apiToken);
    await syncer.sync(args);

    logger.info('Advisory sync completed successfully');
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

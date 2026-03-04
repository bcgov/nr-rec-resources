import { PrismaService } from '@/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { EXPORT_DATASET_BUILDERS } from './datasets/registry';
import {
  type ExportDatasetBuilderContext,
  type ExportQueryContext,
} from './datasets/types';
import { buildFtaFilters, buildRstFilters } from './fragments/filters';
import { buildFtaSharedJoins, buildSharedJoins } from './fragments/joins';
import {
  ftaSharedLegacyExportColumnsBeforeTail,
  ftaSharedLegacyExportColumnsTail,
  legacySharedColumnsBeforeTail,
  legacySharedColumnsTail,
} from './fragments/legacy-columns';
import { displayIndicator, formatTimestamp } from './fragments/formatters';
import {
  ftaPrimaryColumns,
  rstPrimaryColumns,
} from './fragments/source-columns';

export type ExportPreviewRow = Record<string, string | null>;

@Injectable()
export class ExportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPreviewRows(
    params: ExportQueryContext,
  ): Promise<ExportPreviewRow[]> {
    const query = this.buildExportQuery(params);
    const rows = await this.prisma.$queryRaw<Record<string, unknown>[]>(query);

    return rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          this.toCellValue(value),
        ]),
      ),
    );
  }

  async getDownloadRows(params: Omit<ExportQueryContext, 'limit'>) {
    return this.getPreviewRows(params);
  }

  private buildExportQuery({
    dataset,
    district,
    resourceType,
    limit,
  }: ExportQueryContext): Prisma.Sql {
    const rstFilters = buildRstFilters({ district, resourceType });
    const ftaFilters = buildFtaFilters({ district, resourceType });
    const sharedJoins = buildSharedJoins();
    const ftaSharedJoins = buildFtaSharedJoins();
    const builder = EXPORT_DATASET_BUILDERS[dataset];

    if (!builder) {
      throw new BadRequestException(
        `Export dataset is unavailable: ${dataset}`,
      );
    }

    const query = builder.buildQuery(
      this.createDatasetBuilderContext({
        dataset,
        district,
        resourceType,
        limit,
        rstFilters,
        ftaFilters,
        sharedJoins,
        ftaSharedJoins,
      }),
    );

    if (typeof limit === 'number') {
      return Prisma.sql`${query} LIMIT ${limit}`;
    }

    return query;
  }

  private toCellValue(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private createDatasetBuilderContext({
    dataset,
    district,
    resourceType,
    limit,
    rstFilters,
    ftaFilters,
    sharedJoins,
    ftaSharedJoins,
  }: ExportQueryContext & {
    rstFilters: Prisma.Sql;
    ftaFilters: Prisma.Sql;
    sharedJoins: Prisma.Sql;
    ftaSharedJoins: Prisma.Sql;
  }): ExportDatasetBuilderContext {
    return {
      params: {
        dataset,
        district,
        resourceType,
        limit,
      },
      sql: {
        rstFilters,
        ftaFilters,
        sharedJoins,
        ftaSharedJoins,
        rstPrimaryColumns,
        ftaPrimaryColumns,
        legacySharedColumnsBeforeTail,
        legacySharedColumnsTail,
        ftaSharedLegacyExportColumnsBeforeTail,
        ftaSharedLegacyExportColumnsTail,
        displayIndicator,
        formatTimestamp,
      },
    };
  }
}

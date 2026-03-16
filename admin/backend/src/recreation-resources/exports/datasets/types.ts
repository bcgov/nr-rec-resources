import { Prisma } from '@generated/prisma';
import { type ExportDatasetId } from './metadata';

export interface ExportQueryContext {
  dataset: ExportDatasetId;
  district?: string;
  resourceType?: string;
  limit?: number;
}

export interface ExportDatasetSqlContext {
  rstFilters: Prisma.Sql;
  ftaFilters: Prisma.Sql;
  sharedJoins: Prisma.Sql;
  ftaSharedJoins: Prisma.Sql;
  rstPrimaryColumns: () => Prisma.Sql;
  ftaPrimaryColumns: () => Prisma.Sql;
  legacySharedColumnsBeforeTail: () => Prisma.Sql;
  legacySharedColumnsTail: (updatedAtExpression: Prisma.Sql) => Prisma.Sql;
  ftaSharedLegacyExportColumnsBeforeTail: () => Prisma.Sql;
  ftaSharedLegacyExportColumnsTail: (
    updatedAtExpression: Prisma.Sql,
  ) => Prisma.Sql;
  displayIndicator: (expression: Prisma.Sql) => Prisma.Sql;
  formatTimestamp: (expression: Prisma.Sql) => Prisma.Sql;
}

export interface ExportDatasetBuilderContext {
  params: ExportQueryContext;
  sql: ExportDatasetSqlContext;
}

export interface ExportDatasetBuilder {
  id: ExportDatasetId;
  buildQuery(context: ExportDatasetBuilderContext): Prisma.Sql;
}

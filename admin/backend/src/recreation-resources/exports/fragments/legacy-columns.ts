import { Prisma } from '@generated/prisma';
import { describeCode, formatTimestamp } from './formatters';

// RST-side shared columns. Named "legacy" for the shape they mirror, but the
// headers follow RST/frontend naming -- the FTA fragments below keep FTA's.
export function legacySharedColumnsBeforeTail(): Prisma.Sql {
  return Prisma.sql`
    COALESCE(geometry_totals.total_area, '0') AS "TOTAL_AREA",
    COALESCE(geometry_totals.total_length, '0') AS "TOTAL_LENGTH",
    ${describeCode(
      Prisma.sql`rr.risk_rating_code`,
      Prisma.sql`rrrc.description`,
    )} AS "RISK_RATING",
    ${describeCode(
      Prisma.sql`rrtva.rec_resource_type_code`,
      Prisma.sql`rrtva.description`,
    )} AS "RESOURCE_TYPE",
    COALESCE(rsc.description, 'Open') AS "PUBLIC_ACCESS_STATUS",
    COALESCE(resource_counts.defined_campsites, '0') AS "DEFINED_CAMPSITES",
    COALESCE(resource_counts.activity_count, '0') AS "ACTIVITY_COUNT"
  `;
}

export function legacySharedColumnsTail(
  updatedAtExpression: Prisma.Sql,
): Prisma.Sql {
  return Prisma.sql`
    ${formatTimestamp(updatedAtExpression)} AS "UPDATED_AT"
  `;
}

export function ftaSharedLegacyExportColumnsBeforeTail(): Prisma.Sql {
  return Prisma.sql`
    COALESCE(geometry_totals_fta.total_area, '0') AS "TOTAL_AREA",
    COALESCE(geometry_totals_fta.total_length, '0') AS "TOTAL_LENGTH",
    ${describeCode(
      Prisma.sql`rp.recreation_risk_rating_code`,
      Prisma.sql`rrrc_fta.description`,
    )} AS "RISK_RATING",
    ${describeCode(
      Prisma.sql`project_type_fta.recreation_map_feature_code`,
      Prisma.sql`rmfc_fta.description`,
    )} AS "PROJECT_TYPE",
    COALESCE(resource_counts_fta.defined_campsites, '0') AS "DEFINED_CAMPSITES",
    COALESCE(resource_counts_fta.structure_count, '0') AS "STRUCTURE_COUNT",
    COALESCE(resource_counts_fta.activity_count, '0') AS "ACTIVITY_COUNT"
  `;
}

export function ftaSharedLegacyExportColumnsTail(
  updatedAtExpression: Prisma.Sql,
): Prisma.Sql {
  return Prisma.sql`
    ${formatTimestamp(updatedAtExpression)} AS "UPDATE_TIMESTAMP"
  `;
}

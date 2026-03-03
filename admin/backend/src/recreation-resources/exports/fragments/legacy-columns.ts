import { Prisma } from '@generated/prisma';
import { formatTimestamp } from './formatters';

export function legacySharedColumnsBeforeTail(): Prisma.Sql {
  return Prisma.sql`
    COALESCE(geometry_totals.total_area, '0') AS "TOTAL_AREA",
    COALESCE(geometry_totals.total_length, '0') AS "TOTAL_LENGTH",
    rr.risk_rating_code AS "RISK_RATING_CODE",
    rrrc.description AS "RISK_RATING",
    rrtva.rec_resource_type_code AS "PROJECT_TYPE_CODE",
    rrtva.description AS "PROJECT_TYPE",
    rs.status_code::text AS "FILE_STATUS_ST",
    COALESCE(rsc.description, 'Open') AS "STATUS",
    COALESCE(resource_counts.defined_campsites, '0') AS "DEFINED_CAMPSITES",
    COALESCE(resource_counts.structure_count, '0') AS "STRUCTURE_COUNT",
    COALESCE(resource_counts.activity_count, '0') AS "ACTIVITY_COUNT"
  `;
}

export function legacySharedColumnsTail(
  updatedAtExpression: Prisma.Sql,
): Prisma.Sql {
  return Prisma.sql`
    ${formatTimestamp(updatedAtExpression)} AS "UPDATE_TIMESTAMP"
  `;
}

export function ftaSharedLegacyExportColumnsBeforeTail(): Prisma.Sql {
  return Prisma.sql`
    COALESCE(geometry_totals_fta.total_area, '0') AS "TOTAL_AREA",
    COALESCE(geometry_totals_fta.total_length, '0') AS "TOTAL_LENGTH",
    rp.recreation_risk_rating_code AS "RISK_RATING_CODE",
    rrrc_fta.description AS "RISK_RATING",
    project_type_fta.recreation_map_feature_code AS "PROJECT_TYPE_CODE",
    rmfc_fta.description AS "PROJECT_TYPE",
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

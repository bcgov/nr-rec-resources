import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const fileDetailsDataset: ExportDatasetBuilder = {
  id: 'file-details',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      ${sql.describeCode(
        Prisma.sql`rrtva.rec_resource_type_code`,
        Prisma.sql`rrtva.description`,
      )} AS "RESOURCE_TYPE",
      COALESCE(geometry_totals.total_area, '0') AS "TOTAL_AREA",
      CASE
        WHEN rr.right_of_way IS NOT NULL
        THEN ROUND(
          (
            COALESCE(geometry_totals.total_trail_length_km, 0)
            * rr.right_of_way
          ) / 10,
          4
        )::text
        ELSE '0'
      END AS "TOTAL_TRAIL_AREA",
      COALESCE(geometry_totals.total_length, '0') AS "TOTAL_LENGTH",
      COALESCE(geometry_totals.total_trail_length_km, 0)::text AS "TOTAL_TRAIL_LENGTH",
      ${sql.describeCode(
        Prisma.sql`rr.risk_rating_code`,
        Prisma.sql`rrrc.description`,
      )} AS "RISK_RATING",
      COALESCE(rsc.description, 'Open') AS "PUBLIC_ACCESS_STATUS",
      COALESCE(resource_counts.defined_campsites, '0') AS "DEFINED_CAMPSITES",
      COALESCE(resource_counts.activity_count, '0') AS "ACTIVITY_COUNT",
      ${sql.formatTimestamp(Prisma.sql`rr.updated_at`)} AS "UPDATED_AT"
    FROM recreation_resource rr
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id
  `,
};

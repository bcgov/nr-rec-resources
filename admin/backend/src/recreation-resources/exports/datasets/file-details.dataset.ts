import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const fileDetailsDataset: ExportDatasetBuilder = {
  id: 'file-details',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      rrtva.rec_resource_type_code AS "PROJECT_TYPE_CODE",
      rrtva.description AS "PROJECT_TYPE",
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
      COALESCE(geometry_totals.total_trail_length_km, 0)::text AS "TOTAL_TRAIL_LNGTH",
      rr.risk_rating_code AS "RISK_RATING_CODE",
      rrrc.description AS "RISK_RATING",
      rs.status_code::text AS "FILE_STATUS_ST",
      COALESCE(rsc.description, 'Open') AS "STATUS",
      COALESCE(resource_counts.defined_campsites, '0') AS "DEFINED_CAMPSITES",
      COALESCE(resource_counts.activity_count, '0') AS "ACTIVITY_COUNT",
      ${sql.formatTimestamp(Prisma.sql`rr.updated_at`)} AS "UPDATE_TIMESTAMP"
    FROM recreation_resource rr
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id
  `,
};

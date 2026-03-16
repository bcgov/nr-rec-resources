import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const fileDetailsFtaDataset: ExportDatasetBuilder = {
  id: 'file-details-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      project_type_fta.recreation_map_feature_code AS "PROJECT_TYPE_CODE",
      rmfc_fta.description AS "PROJECT_TYPE",
      COALESCE(geometry_totals_fta.total_area, '0') AS "TOTAL_AREA",
      CASE
        WHEN rp.right_of_way IS NOT NULL
        THEN ROUND(
          (
            COALESCE(geometry_totals_fta.total_trail_length_km, 0)
            * rp.right_of_way
          ) / 10,
          4
        )::text
        ELSE '0'
      END AS "TOTAL_TRAIL_AREA",
      COALESCE(geometry_totals_fta.total_length, '0') AS "TOTAL_LENGTH",
      COALESCE(geometry_totals_fta.total_trail_length_km, 0)::text AS "TOTAL_TRAIL_LNGTH",
      rp.recreation_risk_rating_code AS "RISK_RATING_CODE",
      rrrc_fta.description AS "RISK_RATING",
      COALESCE(resource_counts_fta.defined_campsites, '0') AS "DEFINED_CAMPSITES",
      COALESCE(resource_counts_fta.structure_count, '0') AS "STRUCTURE_COUNT",
      COALESCE(resource_counts_fta.activity_count, '0') AS "ACTIVITY_COUNT",
      ${sql.formatTimestamp(
        Prisma.sql`rp.update_timestamp::timestamp`,
      )} AS "UPDATE_TIMESTAMP",
      COALESCE(
        resource_counts_fta.total_remedial_repairs,
        '0'
      ) AS "TOTAL_REMEDIAL_REPAIRS"
    FROM fta.recreation_project rp
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id
  `,
};

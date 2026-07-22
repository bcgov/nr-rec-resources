import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

/**
 * Exports closure info from FTA data.
 *
 * Includes only resources that are Closed (closure_ind = 'Y') and have
 * closure comment text. Archived resources (file status 'AR') are excluded.
 */
export const closureListFtaDataset: ExportDatasetBuilder = {
  id: 'closure-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      district_fta.recreation_district_code AS "DISTRICT_CODE",
      rdc_fta.description AS "DISTRICT",
      project_type_fta.recreation_map_feature_code AS "PROJECT_TYPE_CODE",
      rmfc_fta.description AS "PROJECT_TYPE",
      rp.site_location AS "CLOSEST_COMMUNITY",
      ${sql.displayIndicator(
        Prisma.sql`rp.recreation_view_ind`,
      )} AS "VISIBLE_ON_PUBLIC_SITE",
      rc.project_comment AS "CLOSURE_COMMENT",
      TO_CHAR(rc.comment_date, 'YYYY-MM-DD') AS "CLOSURE_DATE",
      ${sql.formatTimestamp(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, rc.update_timestamp), rc.update_timestamp, rp.update_timestamp::timestamp)`,
      )} AS "UPDATE_TIMESTAMP"
    FROM fta.recreation_comment rc
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = rc.forest_file_id
    LEFT JOIN (
      SELECT DISTINCT ON (rdx.forest_file_id)
        rdx.forest_file_id,
        rdx.recreation_district_code
      FROM fta.recreation_district_xref rdx
      ORDER BY rdx.forest_file_id, rdx.update_timestamp DESC NULLS LAST
    ) district_fta
      ON district_fta.forest_file_id = rp.forest_file_id
    LEFT JOIN fta.recreation_district_code rdc_fta
      ON rdc_fta.recreation_district_code = district_fta.recreation_district_code
    LEFT JOIN fta.prov_forest_use pfu
      ON pfu.forest_file_id = rp.forest_file_id
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
      AND rc.rec_comment_type_code = 'CLOS'
      AND rc.closure_ind = 'Y'
      AND NULLIF(TRIM(rc.project_comment), '') IS NOT NULL
      AND COALESCE(pfu.file_status_st, '') <> 'AR'
    ORDER BY rp.forest_file_id
  `,
};

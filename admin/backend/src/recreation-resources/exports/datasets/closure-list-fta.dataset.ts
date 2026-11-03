import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

/**
 * Exports closure info from FTA data.
 *
 * Includes only resources that are Closed (closure_ind = 'Y') and have
 * closure comment text. Archived files are handled by the shared FTA filter,
 * so the include-archived toggle applies here like it does everywhere else.
 */
export const closureListFtaDataset: ExportDatasetBuilder = {
  id: 'closure-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      ${sql.describeCode(
        Prisma.sql`project_type_fta.recreation_map_feature_code`,
        Prisma.sql`rmfc_fta.description`,
      )} AS "PROJECT_TYPE",
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
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
      AND rc.rec_comment_type_code = 'CLOS'
      AND rc.closure_ind = 'Y'
      AND NULLIF(TRIM(rc.project_comment), '') IS NOT NULL
    ORDER BY rp.forest_file_id
  `,
};

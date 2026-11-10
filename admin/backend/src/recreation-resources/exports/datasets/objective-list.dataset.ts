import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const objectiveListDataset: ExportDatasetBuilder = {
  id: 'objective-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      rr.rec_resource_id AS "REC_RESOURCE_ID",
      rr.name AS "NAME",
      ${sql.describeCode(
        Prisma.sql`rrtva.rec_resource_type_code`,
        Prisma.sql`rrtva.description`,
      )} AS "RESOURCE_TYPE",
      ${sql.describeCode(
        Prisma.sql`rr.district_code`,
        Prisma.sql`rdc_rst.description`,
      )} AS "DISTRICT",
      rr.closest_community AS "CLOSEST_COMMUNITY",
      ${sql.describeCode(
        Prisma.sql`rr.rec_status_code`,
        Prisma.sql`rrsc_rst.description`,
      )} AS "FILE_STATUS",
      TO_CHAR(rr.project_established_date, 'YYYY-MM-DD') AS "PROJECT_ESTABLISHED_DATE",
      ro.objective_description AS "OBJECTIVE_DESCRIPTION",
      TO_CHAR(ro.objective_established_date, 'YYYY-MM-DD') AS "OBJECTIVE_ESTABLISHED_DATE",
      TO_CHAR(ro.objective_amended_date, 'YYYY-MM-DD') AS "OBJECTIVE_AMENDED_DATE",
      TO_CHAR(ro.objective_cancelled_date, 'YYYY-MM-DD') AS "OBJECTIVE_CANCELLED_DATE",
      ro.revision_count::text AS "OBJECTIVE_REVISION_COUNT",
      ro.entry_userid AS "ENTRY_USERID",
      ${sql.formatTimestamp(Prisma.sql`ro.entry_timestamp`)} AS "ENTRY_TIMESTAMP",
      ro.update_userid AS "UPDATE_USERID",
      ${sql.formatTimestamp(Prisma.sql`ro.update_timestamp`)} AS "UPDATE_TIMESTAMP"
    FROM recreation_objective ro
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ro.rec_resource_id
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, ro.objective_id
  `,
};

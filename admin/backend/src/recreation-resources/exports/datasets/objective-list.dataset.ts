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
      rn.body AS "OBJECTIVE_DESCRIPTION",
      TO_CHAR(rn.date_logged, 'YYYY-MM-DD') AS "OBJECTIVE_ESTABLISHED_DATE",
      NULL::text AS "OBJECTIVE_AMENDED_DATE",
      NULL::text AS "OBJECTIVE_CANCELLED_DATE",
      NULL::text AS "OBJECTIVE_REVISION_COUNT",
      rn.created_by AS "ENTRY_USERID",
      ${sql.formatTimestamp(Prisma.sql`rn.created_at`)} AS "ENTRY_TIMESTAMP",
      rn.updated_by AS "UPDATE_USERID",
      ${sql.formatTimestamp(Prisma.sql`rn.updated_at`)} AS "UPDATE_TIMESTAMP"
    FROM recreation_resource_note rn
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = rn.rec_resource_id
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
      AND rn.note_type_code = 'OBJECTIVE'
      AND rn.source_system = 'FTA'
    ORDER BY rr.rec_resource_id, rn.date_logged, rn.note_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const partnersListDataset: ExportDatasetBuilder = {
  id: 'partners-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      CASE 
        WHEN COUNT(rf.recreation_fee_code) > 0 AND agreement_end_date >= CURRENT_DATE THEN 'Yes'
        ELSE 'No'
      END AS "IS_RECREATION_OPERATOR",
      ah.client_number AS "CLIENT_NUMBER",
      ah.visible_on_public_website AS "DISPLAY_ON_WEBSITE",
      TO_CHAR(ah.agreement_start_date, 'YYYY-MM-DD') AS "AGREEMENT_START_DATE",
      TO_CHAR(ah.agreement_end_date, 'YYYY-MM-DD') AS "AGREEMENT_END_DATE",
      ah.revision_count AS "REVISION_COUNT",
      ah.partner_relationship_type_code AS "RELATIONSHIP_TYPE_CODE",
      ${sql.formatTimestamp(Prisma.sql`ah.updated_at`)} AS "CREATE_TIMESTAMP",
      ah.updated_by AS "UPDATED_BY",
      ${sql.formatTimestamp(Prisma.sql`ah.created_at`)} AS "UPDATE_TIMESTAMP",
      ah.created_by AS "CREATED_BY"
    FROM rst.recreation_agreement_holder ah
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ah.rec_resource_id
    LEFT OUTER JOIN rst.recreation_fee rf
	    ON rf.rec_resource_id = rr.rec_resource_id
    WHERE ${sql.rstFilters}
    GROUP BY
      rr.rec_resource_id,
      rr.name,
      ah.rec_resource_id,
      ah.client_number,
      ah.visible_on_public_website,
      ah.agreement_start_date,
      ah.agreement_end_date,
      ah.revision_count,
      ah.partner_relationship_type_code,
      ah.updated_at,
      ah.updated_by,
      ah.created_at,
      ah.created_by
    ORDER BY ah.rec_resource_id
  `,
};

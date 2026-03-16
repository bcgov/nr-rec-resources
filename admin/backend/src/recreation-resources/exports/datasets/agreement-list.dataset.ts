import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const agreementListDataset: ExportDatasetBuilder = {
  id: 'agreement-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      rah.client_number AS "CLIENT_NUMBER",
      TO_CHAR(rah.agreement_start_date, 'YYYY-MM-DD') AS "AGREEMENT_START_DATE",
      TO_CHAR(rah.agreement_end_date, 'YYYY-MM-DD') AS "AGREEMENT_END_DATE",
      rah.revision_count::text AS "REVISION_COUNT",
      ${sql.legacySharedColumnsBeforeTail()},
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, rah.updated_at), rr.updated_at, rah.updated_at)`,
      )}
    FROM recreation_agreement_holder rah
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = rah.rec_resource_id
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id
  `,
};

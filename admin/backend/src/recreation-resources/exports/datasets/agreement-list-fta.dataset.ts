import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const agreementListFtaDataset: ExportDatasetBuilder = {
  id: 'agreement-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      rah.client_number AS "CLIENT_NUMBER",
      TO_CHAR(rah.agreement_start_date, 'YYYY-MM-DD') AS "AGREEMENT_START_DATE",
      TO_CHAR(rah.agreement_end_date, 'YYYY-MM-DD') AS "AGREEMENT_END_DATE",
      rah.revision_count::text AS "REVISION_COUNT",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, rah.update_timestamp), rah.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_agreement_holder rah
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = rah.forest_file_id
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, rah.agreement_holder_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const campsiteListFtaDataset: ExportDatasetBuilder = {
  id: 'campsite-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      rdc.campsite_number::text AS "CAMPSITE_NUMBER",
      rdc.estimated_repair_cost::text AS "ESTIMATED_REPAIR_COST",
      rdc.recreation_remed_repair_code AS "RECREATION_REMED_REPAIR_CODE",
      TO_CHAR(rdc.repair_complete_date, 'YYYY-MM-DD') AS "REPAIR_COMPLETE_DATE",
      rrc.description AS "RECREATION_REMED_REPAIR",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, rdc.update_timestamp), rdc.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_defined_campsite rdc
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = rdc.forest_file_id
    LEFT JOIN fta.recreation_remed_repair_code rrc
      ON rrc.recreation_remed_repair_code = rdc.recreation_remed_repair_code
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, rdc.campsite_number
  `,
};

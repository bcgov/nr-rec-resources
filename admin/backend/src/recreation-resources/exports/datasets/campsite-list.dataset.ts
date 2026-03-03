import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const campsiteListDataset: ExportDatasetBuilder = {
  id: 'campsite-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      rdc2.campsite_number::text AS "CAMPSITE_NUMBER",
      rdc2.estimated_repair_cost::text AS "ESTIMATED_REPAIR_COST",
      rdc2.recreation_remed_repair_code AS "RECREATION_REMED_REPAIR_CODE",
      TO_CHAR(rdc2.repair_complete_date, 'YYYY-MM-DD') AS "REPAIR_COMPLETE_DATE",
      rrc.description AS "RECREATION_REMED_REPAIR",
      ${sql.legacySharedColumnsBeforeTail()},
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, rdc2.updated_at), rr.updated_at, rdc2.updated_at)`,
      )}
    FROM recreation_defined_campsite rdc2
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = rdc2.rec_resource_id
    LEFT JOIN recreation_remed_repair_code rrc
      ON rrc.recreation_remed_repair_code = rdc2.recreation_remed_repair_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, rdc2.campsite_number
  `,
};

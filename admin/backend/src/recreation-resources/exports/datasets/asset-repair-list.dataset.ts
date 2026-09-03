import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const assetRepairListDataset: ExportDatasetBuilder = {
  id: 'asset-repair-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      ra.asset_id::text AS "ASSET_ID",
      ra.asset_name AS "ASSET_NAME",
      ra.asset_comment AS "ASSET_COMMENT",
      rap.repair_id::text AS "REPAIR_ID",
      rrc.description AS "REPAIR_TYPE",
      rap.estimated_repair_cost::text AS "ESTIMATED_REPAIR_COST",
      rap.actual_repair_cost::text AS "ACTUAL_REPAIR_COST",
      TO_CHAR(rap.repair_completed_date, 'YYYY-MM-DD') AS "REPAIR_COMPLETED_DATE",
      rap.urgency AS "URGENCY",
      rap.trail_segment_start AS "TRAIL_SEGMENT_START",
      rap.trail_segment_end AS "TRAIL_SEGMENT_END",
      rap.created_by AS "CREATED_BY",
      ${sql.formatTimestamp(Prisma.sql`rap.created_at`)} AS "CREATE_TIMESTAMP",
      rap.updated_by AS "UPDATED_BY",
      ${sql.formatTimestamp(Prisma.sql`rap.updated_at`)} AS "UPDATE_TIMESTAMP"
    FROM recreation_asset_repair rap
    INNER JOIN recreation_asset ra
      ON ra.asset_id = rap.asset_id
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ra.rec_resource_id
    LEFT JOIN recreation_remed_repair_code rrc
      ON rrc.recreation_remed_repair_code = rap.recreation_remed_repair_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, ra.asset_id, rap.repair_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const feeListDataset: ExportDatasetBuilder = {
  id: 'fee-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      rf.recreation_fee_code AS "RECREATION_FEE_CODE",
      rfc.description AS "DESCRIPTION",
      rfc.description AS "RECREATION_FEE_DESC",
      rf.fee_amount::text AS "FEE_AMOUNT",
      TO_CHAR(rf.fee_start_date, 'YYYY-MM-DD') AS "FEE_START_DATE",
      TO_CHAR(rf.fee_end_date, 'YYYY-MM-DD') AS "FEE_END_DATE",
      ${sql.displayIndicator(Prisma.sql`rf.monday_ind`)} AS "DSP_MONDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.tuesday_ind`)} AS "DSP_TUESDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.wednesday_ind`)} AS "DSP_WEDNESDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.thursday_ind`)} AS "DSP_THURSDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.friday_ind`)} AS "DSP_FRIDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.saturday_ind`)} AS "DSP_SATURDAY_IND",
      ${sql.displayIndicator(Prisma.sql`rf.sunday_ind`)} AS "DSP_SUNDAY_IND",
      rf.monday_ind AS "MONDAY_IND",
      rf.tuesday_ind AS "TUESDAY_IND",
      rf.wednesday_ind AS "WEDNESDAY_IND",
      rf.thursday_ind AS "THURSDAY_IND",
      rf.friday_ind AS "FRIDAY_IND",
      rf.saturday_ind AS "SATURDAY_IND",
      rf.sunday_ind AS "SUNDAY_IND",
      ${sql.legacySharedColumnsBeforeTail()},
      rf.fee_id::text AS "FEE_ID",
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, rf.updated_at), rr.updated_at, rf.updated_at)`,
      )}
    FROM recreation_fee rf
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = rf.rec_resource_id
    LEFT JOIN recreation_fee_code rfc
      ON rfc.recreation_fee_code = rf.recreation_fee_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, rf.fee_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const feeListFtaDataset: ExportDatasetBuilder = {
  id: 'fee-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
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
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      rf.fee_id::text AS "FEE_ID",
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, rf.update_timestamp), rf.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_fee rf
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = rf.forest_file_id
    LEFT JOIN fta.recreation_fee_code rfc
      ON rfc.recreation_fee_code = rf.recreation_fee_code
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, rf.fee_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const siteInspectionFtaDataset: ExportDatasetBuilder = {
  id: 'site-inspection-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      rir.inspection_id::text AS "INSPECTION_ID",
      rir.site_occupancy_code AS "SITE_OCCUPANCY_CODE",
      rir.rec_file_type_code AS "REC_FILE_TYPE_CODE",
      rir.site_name AS "SITE_NAME",
      rir.location AS "LOCATION",
      rir.inspected_by AS "INSPECTED_BY",
      rir.campsite_no::text AS "CAMPSITE_NO",
      rir.occupied_campsite_no::text AS "OCCUPIED_CAMPSITE_NO",
      rir.vehicle_no::text AS "VEHICLE_NO",
      rir.camping_party_no::text AS "CAMPING_PARTY_NO",
      rir.day_use_party_no::text AS "DAY_USE_PARTY_NO",
      rir.with_pass_no::text AS "WITH_PASS_NO",
      rir.without_pass_no::text AS "WITHOUT_PASS_NO",
      rir.absent_owner_no::text AS "ABSENT_OWNER_NO",
      rir.total_inspected_no::text AS "TOTAL_INSPECTED_NO",
      rir.purchased_pass_no::text AS "PURCHASED_PASS_NO",
      rir.refused_pass_no::text AS "REFUSED_PASS_NO",
      rir.contract_id AS "CONTRACT_ID",
      rir.contractor AS "CONTRACTOR",
      ${sql.formatTimestamp(
        Prisma.sql`COALESCE(rir.update_timestamp, rp.update_timestamp::timestamp)`,
      )} AS "UPDATE_TIMESTAMP"
    FROM fta.recreation_inspection_report rir
    LEFT JOIN fta.recreation_project rp
      ON rp.forest_file_id = rir.forest_file_id
    WHERE ${sql.ftaFilters}
    ORDER BY rir.forest_file_id, rir.inspection_id
  `,
};

import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const siteInspectionFtaDataset: ExportDatasetBuilder = {
  id: 'site-inspection-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      rp.forest_file_id AS "FOREST_FILE_ID",
      ${sql.describeCode(
        Prisma.sql`rir.rec_file_type_code`,
        Prisma.sql`rftc.description`,
      )} AS "FILE_TYPE_DESC",
      rp.project_name AS "PROJECT_NAME",
      ${sql.describeCode(
        Prisma.sql`pfu_fta.file_status_st`,
        Prisma.sql`rfsc_fta.description`,
      )} AS "FILE_STATUS",
      ${sql.describeCode(
        Prisma.sql`project_type_fta.recreation_map_feature_code`,
        Prisma.sql`rmfc_fta.description`,
      )} AS "PROJECT_TYPE",
      rp.right_of_way::text AS "RIGHT_OF_WAY",
      ${sql.describeCode(
        Prisma.sql`rp.recreation_risk_rating_code`,
        Prisma.sql`rrrc_fta.description`,
      )} AS "RISK_RATING",
      ${sql.describeCode(
        Prisma.sql`rp.recreation_feature_code`,
        Prisma.sql`rfc.description`,
      )} AS "FEATURE",
      COALESCE(geometry_totals_fta.total_length, '0') AS "TOTAL_LENGTH",
      COALESCE(geometry_totals_fta.total_area, '0') AS "TOTAL_AREA",
      ${sql.describeCode(
        Prisma.sql`rp.recreation_user_days_code`,
        Prisma.sql`rudc.description`,
      )} AS "USER_DAYS",
      COALESCE(resource_counts_fta.defined_campsites, '0') AS "DEFINED_CAMPSITES",
      COALESCE(rp.overflow_campsites, 0)::text AS "OVERFLOW_CAMPSITES",
      ${sql.describeCode(
        Prisma.sql`rp.recreation_control_access_code`,
        Prisma.sql`rcac.description`,
      )} AS "CONTROL_ACCESS",
      rp.utm_zone::text AS "UTM_ZONE",
      rp.utm_easting::text AS "UTM_EASTING",
      rp.utm_northing::text AS "UTM_NORTHING",
      TO_CHAR(rp.last_rec_inspection_date, 'YYYY-MM-DD') AS "LAST_REC_INSPECTION_DATE",
      TO_CHAR(rp.project_established_date, 'YYYY-MM-DD') AS "PROJECT_ESTABLISHED_DATE",
      ${sql.displayIndicator(
        Prisma.sql`rp.resource_feature_ind`,
      )} AS "RECREATION_FEATURE",
      (
        SELECT STRING_AGG(
          DISTINCT rdc.description,
          ', '
          ORDER BY rdc.description
        )
        FROM fta.recreation_district_xref rdx
        LEFT JOIN fta.recreation_district_code rdc
          ON rdc.recreation_district_code = rdx.recreation_district_code
        WHERE rdx.forest_file_id = rp.forest_file_id
      ) AS "REC_DIST",
      rp.site_location AS "SITE_LOCATION",
      rp.site_description AS "SITE_DESCRIPTION",
      ${sql.displayIndicator(
        Prisma.sql`rp.recreation_view_ind`,
      )} AS "RECREATION_VIEW_IND",
      (
        SELECT COUNT(*)::text
        FROM fta.recreation_objective ro
        WHERE ro.forest_file_id = rp.forest_file_id
      ) AS "OBJ_COUNT",
      COALESCE(resource_counts_fta.total_remedial_repairs, '0') AS "REM_REPAIR_COUNT",
      ${sql.displayIndicator(
        Prisma.sql`rp.arch_impact_assess_ind`,
      )} AS "ARCH_IMPACT_ASSESS_IND",
      ${sql.describeCode(
        Prisma.sql`rp.recreation_maintain_std_code`,
        Prisma.sql`rmsc.description`,
      )} AS "MAINTAIN_STD",
      COALESCE(resource_counts_fta.structure_count, '0') AS "STRUCTURE_COUNT",
      COALESCE(resource_counts_fta.activity_count, '0') AS "ACTIVITY_COUNT",
      rir.entry_userid AS "ENTRY_USERID",
      ${sql.formatTimestamp(Prisma.sql`rir.entry_timestamp`)} AS "ENTRY_TIMESTAMP",
      rir.update_userid AS "UPDATE_USERID",
      ${sql.formatTimestamp(
        Prisma.sql`COALESCE(rir.update_timestamp, rp.update_timestamp::timestamp)`,
      )} AS "UPDATE_TIMESTAMP"
    FROM fta.recreation_inspection_report rir
    LEFT JOIN fta.recreation_project rp
      ON rp.forest_file_id = rir.forest_file_id
    ${sql.ftaSharedJoins}
    LEFT JOIN fta.recreation_file_type_code rftc
      ON rftc.recreation_file_type_code = rir.rec_file_type_code
    LEFT JOIN fta.recreation_feature_code rfc
      ON rfc.recreation_feature_code = rp.recreation_feature_code
    LEFT JOIN fta.recreation_control_access_code rcac
      ON rcac.recreation_control_access_code = rp.recreation_control_access_code
    LEFT JOIN fta.recreation_user_days_code rudc
      ON rudc.recreation_user_days_code = rp.recreation_user_days_code
    LEFT JOIN fta.recreation_maintain_std_code rmsc
      ON rmsc.recreation_maintain_std_code = rp.recreation_maintain_std_code
    WHERE ${sql.ftaFilters}
    ORDER BY rir.forest_file_id, rir.inspection_id
  `,
};

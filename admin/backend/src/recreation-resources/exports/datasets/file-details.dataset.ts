import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const fileDetailsDataset: ExportDatasetBuilder = {
  id: 'file-details',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      rr.rec_resource_id AS "REC_RESOURCE_ID",
      rr.name AS "NAME",
      ${sql.describeCode(
        Prisma.sql`rrtva.rec_resource_type_code`,
        Prisma.sql`rrtva.description`,
      )} AS "RESOURCE_TYPE",
      ${sql.describeCode(
        Prisma.sql`rr.district_code`,
        Prisma.sql`rdc_rst.description`,
      )} AS "DISTRICT",
      rr.closest_community AS "CLOSEST_COMMUNITY",
      ${sql.describeCode(
        Prisma.sql`rr.rec_status_code`,
        Prisma.sql`rrsc_rst.description`,
      )} AS "FILE_STATUS",
      TO_CHAR(rr.project_established_date, 'YYYY-MM-DD') AS "PROJECT_ESTABLISHED_DATE",
      CASE WHEN fees.rec_resource_id IS NOT NULL THEN 'Y' ELSE 'N' END AS "Fees (Y/N)",
      CASE WHEN rrri.rec_resource_id IS NOT NULL THEN 'Y' ELSE 'N' END AS "Reservations (Y/N)",
      ${sql.describeCode(
        Prisma.sql`rr.risk_rating_code`,
        Prisma.sql`rrrc.description`,
      )} AS "RISK_RATING",
      ${sql.displayIndicator(Prisma.sql`rr.resource_feature_ind`)} AS "RECREATION_FEATURE",
      feature_agg.feature_codes AS "FEATURE_CODE",
      feature_agg.feature_descriptions AS "FEATURE",
      rr.right_of_way::text AS "RIGHT_OF_WAY",
      COALESCE(geometry_totals.total_length, '0') AS "TOTAL_LENGTH",
      COALESCE(geometry_totals.total_area, '0') AS "TOTAL_AREA",
      NULL::text AS "USER_DAYS",
      COALESCE(asset_counts.defined_campsites, '0') AS "DEFINED_CAMPSITES",
      COALESCE(to_jsonb(rr)->>'overflow_campsites', '0') AS "OVERFLOW_CAMPSITES",
      ${sql.describeCode(
        Prisma.sql`rr.control_access_code`,
        Prisma.sql`rcac.description`,
      )} AS "CONTROL_ACCESS",
      NULL::text AS "UTM_ZONE",
      NULL::text AS "UTM_EASTING",
      NULL::text AS "UTM_NORTHING",
      TO_CHAR(rr.last_rec_inspection_date, 'YYYY-MM-DD') AS "LAST_REC_INSPECTION_DATE",
      TO_CHAR(rr.last_hzrd_tree_assess_date, 'YYYY-MM-DD') AS "LAST_HAZARD_TREE_INSPECTION",
      COALESCE(rsd.description, rr.description) AS "FIELD_NOTE",
      ${sql.booleanIndicator(Prisma.sql`rr.display_on_public_site`)} AS "DISPLAY_ON_PUBLIC_SITE",
      COALESCE(rsc.description, 'Open') AS "PUBLIC_ACCESS_STATUS",
      COALESCE(resource_counts.total_remedial_repairs, '0') AS "REM_REPAIR_COUNT",
      ${sql.displayIndicator(Prisma.sql`rr.arch_impact_assess_ind`)} AS "ARCH_IMPACT_ASSESS_IND",
      to_jsonb(rr)->>'arch_impact_assess_date' AS "ARCH_IMPACT_ASSESS_DATE",
      ${sql.describeCode(
        Prisma.sql`rr.maintenance_standard_code`,
        Prisma.sql`rmsc.description`,
      )} AS "MAINTAIN_STD",
      COALESCE(asset_counts.assets_count, '0') AS "ASSETS_COUNT",
      COALESCE(resource_counts.activity_count, '0') AS "ACTIVITY_COUNT"
    FROM recreation_resource rr
    ${sql.sharedJoins}
    LEFT JOIN recreation_resource_reservation_info rrri
      ON rrri.rec_resource_id = rr.rec_resource_id
    LEFT JOIN recreation_control_access_code rcac
      ON rcac.recreation_control_access_code = rr.control_access_code
    LEFT JOIN recreation_maintenance_standard_code rmsc
      ON rmsc.maintenance_standard_code = rr.maintenance_standard_code
    LEFT JOIN recreation_site_description rsd
      ON rsd.rec_resource_id = rr.rec_resource_id
    LEFT JOIN (
      SELECT DISTINCT rec_resource_id
      FROM recreation_fee
      WHERE is_deleted = false
    ) fees
      ON fees.rec_resource_id = rr.rec_resource_id
    LEFT JOIN (
      SELECT
        rf.rec_resource_id,
        STRING_AGG(
          DISTINCT rf.recreation_feature_code,
          ', '
          ORDER BY rf.recreation_feature_code
        ) AS feature_codes,
        STRING_AGG(
          DISTINCT rfc.description,
          ', '
          ORDER BY rfc.description
        ) AS feature_descriptions
      FROM recreation_feature rf
      LEFT JOIN recreation_feature_code rfc
        ON rfc.recreation_feature_code = rf.recreation_feature_code
      GROUP BY rf.rec_resource_id
    ) feature_agg
      ON feature_agg.rec_resource_id = rr.rec_resource_id
    LEFT JOIN (
      SELECT
        ra.rec_resource_id,
        COUNT(*) FILTER (WHERE ra.asset_code = 227)::text AS defined_campsites,
        COUNT(*) FILTER (WHERE ra.asset_code <> 227)::text AS assets_count
      FROM recreation_asset ra
      GROUP BY ra.rec_resource_id
    ) asset_counts
      ON asset_counts.rec_resource_id = rr.rec_resource_id
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id
  `,
};

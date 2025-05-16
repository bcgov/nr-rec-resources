import { Prisma } from "@prisma/client";
import { FilterTypes } from "../service/types";
import { EXCLUDED_ACTIVITY_CODES } from "../constants/service.constants";

export function buildFilterOptionCountsQuery(
  whereClause: Prisma.Sql,
  filterTypes?: FilterTypes,
): Prisma.Sql {
  return Prisma.sql`
  WITH filtered_resources AS (
    SELECT
      rec_resource_id,
      district_code,
      access_code,
      recreation_resource_type_code,
      has_toilets,
      has_tables
    FROM recreation_resource_search_view
    ${whereClause}
  ),
  activity_counts AS (
    SELECT
      rac.recreation_activity_code,
      rac.description,
      COUNT(DISTINCT fr.rec_resource_id)::INT AS recreation_activity_count
    FROM rst.recreation_activity_code rac
    LEFT JOIN rst.recreation_activity ra ON rac.recreation_activity_code = ra.recreation_activity_code
    LEFT JOIN filtered_resources fr ON fr.rec_resource_id = ra.rec_resource_id
    WHERE rac.recreation_activity_code NOT IN (${Prisma.join(EXCLUDED_ACTIVITY_CODES)})
    GROUP BY rac.recreation_activity_code, rac.description
    ORDER BY rac.description ASC
  ),
  district_counts AS (
    SELECT
      dcv.district_code AS code,
      MAX(dcv.description) AS description,
      CASE
        WHEN ${
          filterTypes?.isOnlyDistrictFilter ?? false
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code)::INT
        ELSE COUNT(fr.district_code)::INT
      END AS count
    FROM recreation_resource_district_count_view dcv
    LEFT JOIN filtered_resources fr ON fr.district_code = dcv.district_code
    WHERE dcv.district_code != 'NULL'
    GROUP BY dcv.district_code, dcv.description
    ORDER BY dcv.description ASC
  ),
  access_counts AS (
    SELECT
      acv.access_code AS code,
      acv.access_description AS description,
      CASE
        WHEN ${
          filterTypes?.isOnlyAccessFilter ?? false
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code)::INT
        ELSE COUNT(fr.access_code)::INT
      END AS count
    FROM recreation_resource_access_count_view acv
    LEFT JOIN filtered_resources fr ON fr.access_code = acv.access_code
    WHERE acv.access_code != 'NULL'
    GROUP BY acv.access_code, acv.access_description
    ORDER BY acv.access_description ASC
  ),
  type_counts AS (
    SELECT
      acv.rec_resource_type_code AS code,
      MAX(acv.description) AS description,
      CASE
        WHEN ${
          filterTypes?.isOnlyTypeFilter ?? false
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code)::INT
        ELSE COUNT(fr.recreation_resource_type_code)::INT
      END AS count
    FROM recreation_resource_type_count_view acv
    LEFT JOIN filtered_resources fr ON fr.recreation_resource_type_code = acv.rec_resource_type_code
    GROUP BY acv.rec_resource_type_code, acv.description
    ORDER BY acv.rec_resource_type_code DESC
  ),
  facility_counts AS (
    SELECT
      COUNT(CASE WHEN has_toilets THEN 1 END)::INT AS total_toilet_count,
      COUNT(CASE WHEN has_tables THEN 1 END)::INT AS total_table_count,
      COUNT(*)::INT AS total_count
    FROM filtered_resources
  )
  SELECT
    'activity' AS type,
    ac.recreation_activity_code::TEXT AS code,
    ac.description,
    ac.recreation_activity_count AS count
  FROM activity_counts ac

  UNION ALL

  SELECT
    'district', dc.code, dc.description, dc.count
  FROM district_counts dc

  UNION ALL

  SELECT
    'access', ac.code, ac.description, ac.count
  FROM access_counts ac

  UNION ALL

  SELECT
    'type', tc.code, tc.description, tc.count
  FROM type_counts tc

  UNION ALL

  SELECT
    'facilities', 'toilet', 'Toilets', fc.total_toilet_count
  FROM facility_counts fc

  UNION ALL

  SELECT
    'facilities', 'table', 'Tables', fc.total_table_count
  FROM facility_counts fc
`;
}

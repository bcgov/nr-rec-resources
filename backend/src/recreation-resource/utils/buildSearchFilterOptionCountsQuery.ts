import { Prisma } from "@prisma/client";
import { FilterTypes } from "../service/types";
import { EXCLUDED_ACTIVITY_CODES } from "../constants/service.constants";

export function buildFilterOptionCountsQuery(
  whereClause: Prisma.Sql,
  filterTypes?: FilterTypes,
): Prisma.Sql {
  return Prisma.sql`
  WITH filtered_resources AS (
    SELECT *
    FROM recreation_resource_search_view
    ${whereClause}
  ),
  structure_counts AS (
    SELECT
      COUNT(*) AS total_count,
      COUNT(CASE WHEN has_toilets THEN 1 END)::INT AS total_toilet_count,
      COUNT(CASE WHEN has_tables THEN 1 END)::INT AS total_table_count
    FROM filtered_resources
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
  ),
  district_counts AS (
    SELECT dcv.district_code    AS code,
           MAX(dcv.description) AS description,
           CASE
             WHEN ${filterTypes?.isOnlyDistrictFilter ?? false} THEN
               (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code)::INT
          ELSE
              COUNT(fr.district_code)::INT
          END AS count
    FROM recreation_resource_district_count_view dcv
      LEFT JOIN filtered_resources fr
    ON fr.district_code = dcv.district_code
    WHERE dcv.district_code != 'NULL'
    GROUP BY dcv.district_code, dcv.description
  ),
  access_counts AS (
    SELECT acv.access_code AS code, acv.access_description AS description,
    CASE
      WHEN ${filterTypes?.isOnlyAccessFilter ?? false} THEN
          (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code)::INT
      ELSE
          COUNT(fr.access_code)::INT
      END AS count
    FROM recreation_resource_access_count_view acv
      LEFT JOIN filtered_resources fr
    ON fr.access_code = acv.access_code
    WHERE acv.access_code != 'NULL'
    GROUP BY acv.access_code, acv.access_description
  ),
  type_counts AS (
    SELECT acv.rec_resource_type_code AS code,
      MAX(acv.description) AS description,
    CASE
      WHEN ${filterTypes?.isOnlyTypeFilter ?? false} THEN
          (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code)::INT
      ELSE
          COUNT(fr.recreation_resource_type_code)::INT
      END AS count
    FROM recreation_resource_type_count_view acv
      LEFT JOIN filtered_resources fr
    ON fr.recreation_resource_type_code = acv.rec_resource_type_code
    GROUP BY acv.rec_resource_type_code, acv.description
  )

  SELECT 
    'activity' AS type,
    ac.recreation_activity_code::TEXT AS code,
    ac.description,
    ac.recreation_activity_count AS count,
    NULL::INT AS total_toilet_count,
    NULL::INT AS total_table_count,
    sc.total_count
  FROM activity_counts ac, structure_counts sc

  UNION ALL

  SELECT 
    'district', dc.code, dc.description, dc.count, NULL, NULL, sc.total_count
  FROM district_counts dc, structure_counts sc

  UNION ALL
  
  SELECT 
    'access', ac.code, ac.description, ac.count, NULL, NULL, sc.total_count
  FROM access_counts ac, structure_counts sc

  UNION ALL

  SELECT 
    'type', tc.code, tc.description, tc.count, NULL, NULL, sc.total_count
  FROM type_counts tc, structure_counts sc

  UNION ALL

  SELECT 
    'facilities', 'toilet', 'Toilets', sc.total_toilet_count, sc.total_toilet_count, sc.total_table_count, sc.total_count
  FROM structure_counts sc

  UNION ALL

  SELECT 
    'facilities', 'table', 'Tables', sc.total_table_count, sc.total_toilet_count, sc.total_table_count, sc.total_count
  FROM structure_counts sc

  ORDER BY type, description ASC;
`;
}

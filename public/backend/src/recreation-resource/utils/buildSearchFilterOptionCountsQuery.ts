import { Prisma } from "@prisma/client";
import { FilterTypes } from "../service/types";
import { EXCLUDED_ACTIVITY_CODES } from "../constants/service.constants";

export interface BuildFilterOptionCountsQueryOptions {
  whereClause: Prisma.Sql;
  searchText?: string;
  filterTypes?: FilterTypes;
  lat?: number;
  lon?: number;
}

export function buildFilterOptionCountsQuery({
  whereClause,
  searchText = "",
  filterTypes,
  lat,
  lon,
}: BuildFilterOptionCountsQueryOptions): Prisma.Sql {
  const textSearchCondition = searchText
    ? Prisma.sql` AND (name ilike ${"%" + searchText + "%"} or closest_community ilike ${"%" + searchText + "%"})`
    : Prisma.empty;
  const locationFilter =
    typeof lat === "number" && typeof lon === "number"
      ? Prisma.sql`AND public.ST_DWithin(
        recreation_site_point,
        public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005),
        50000
      )`
      : Prisma.empty;

  const extraFilters = Prisma.sql`${textSearchCondition} ${locationFilter}`;

  return Prisma.sql`
  WITH filtered_resources AS (
    SELECT rec_resource_id, district_code, access_code,
           recreation_resource_type_code, has_toilets, has_tables
    FROM recreation_resource_search_view
    ${whereClause}
    LIMIT 5000
  ),
  filtered_ids AS (
    SELECT ARRAY_AGG(rec_resource_id) AS rec_resource_ids
    FROM filtered_resources
  ),
  facility_counts AS (
   SELECT
     SUM(has_toilets::int)::int AS total_toilet_count,
     SUM(has_tables::int)::int AS total_table_count
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
    ORDER BY rac.description ASC
  ),
  district_counts AS (
    SELECT
      dcv.district_code AS code,
      MAX(dcv.description) AS description,
      CASE
        WHEN ${
          filterTypes?.isOnlyDistrictFilter ?? false
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code ${extraFilters})::INT
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
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code ${extraFilters})::INT
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
        } THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code ${extraFilters})::INT
        ELSE COUNT(fr.recreation_resource_type_code)::INT
      END AS count
    FROM recreation_resource_type_count_view acv
    LEFT JOIN filtered_resources fr ON fr.recreation_resource_type_code = acv.rec_resource_type_code
    GROUP BY acv.rec_resource_type_code, acv.description
    ORDER BY acv.rec_resource_type_code DESC
  ),
  extent_calc AS (
    SELECT
      public.ST_Extent(recreation_site_point) AS extent_geom
    FROM recreation_resource_search_view
    ${whereClause}
  )
  SELECT
    'activity' AS type,
    ac.recreation_activity_code::TEXT AS code,
    ac.description,
    ac.recreation_activity_count AS count,
    NULL::TEXT[] AS rec_resource_ids,
    NULL::TEXT AS extent
  FROM activity_counts ac

  UNION ALL

  SELECT
    'district', dc.code, dc.description, dc.count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM district_counts dc

  UNION ALL

  SELECT
    'access', ac.code, ac.description, ac.count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM access_counts ac

  UNION ALL

  SELECT
    'type', tc.code, tc.description, tc.count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM type_counts tc

  UNION ALL

  SELECT 'facilities', 'toilet', 'Toilets', total_toilet_count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM facility_counts

  UNION ALL

  SELECT 'facilities', 'table', 'Tables', total_table_count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM facility_counts

  UNION ALL

  SELECT 'ids', NULL, NULL, NULL, rec_resource_ids, NULL::TEXT AS extent_geom
  FROM filtered_ids

  UNION ALL

  SELECT 'extent', NULL, NULL, NULL, NULL, public.ST_AsGeoJSON(extent_geom)::TEXT
  FROM extent_calc;`;
}

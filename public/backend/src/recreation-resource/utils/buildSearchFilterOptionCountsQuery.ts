import { Prisma } from '@generated/prisma';
import { FilterTypes } from '../service/types';
import { EXCLUDED_ACTIVITY_CODES } from '../constants/service.constants';

export interface BuildFilterOptionCountsQueryOptions {
  whereClause: Prisma.Sql;
  whereClauseExcludingType: Prisma.Sql;
  whereClauseExcludingDistrict: Prisma.Sql;
  searchText?: string;
  filterTypes?: FilterTypes;
  lat?: number;
  lon?: number;
  useAdvisoryStatus?: boolean;
}

export function buildFilterOptionCountsQuery({
  whereClause,
  whereClauseExcludingType,
  whereClauseExcludingDistrict,
  searchText = '',
  filterTypes,
  lat,
  lon,
  useAdvisoryStatus = false,
}: BuildFilterOptionCountsQueryOptions): Prisma.Sql {
  const textSearchCondition = searchText
    ? Prisma.sql` AND (name ilike ${'%' + searchText + '%'} or closest_community ilike ${'%' + searchText + '%'})`
    : Prisma.empty;
  const locationFilter =
    typeof lat === 'number' && typeof lon === 'number'
      ? Prisma.sql`AND public.ST_DWithin(
        recreation_site_point,
        public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005),
        50000
      )`
      : Prisma.empty;

  const extraFilters = Prisma.sql`AND display_on_public_site = true ${textSearchCondition} ${locationFilter}`;

  return Prisma.sql`
  WITH filtered_resources AS (
    SELECT rec_resource_id, district_code, access_code,
           recreation_resource_type_code, has_toilets, has_tables,
           recreation_status, is_fees, is_reservable
    FROM recreation_resource_search_view rrsv
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
  type_filter_resources AS (
    SELECT rec_resource_id, recreation_resource_type_code
    FROM recreation_resource_search_view rrsv
    ${whereClauseExcludingType}
    LIMIT 5000
  ),
  district_filter_resources AS (
    SELECT rec_resource_id, district_code
    FROM recreation_resource_search_view rrsv
    ${whereClauseExcludingDistrict}
    LIMIT 5000
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
      COUNT(dfr.district_code)::INT AS count
    FROM recreation_resource_district_count_view dcv
    LEFT JOIN district_filter_resources dfr ON dfr.district_code = dcv.district_code
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
      COUNT(tfr.recreation_resource_type_code)::INT AS count
    FROM recreation_resource_type_count_view acv
    LEFT JOIN type_filter_resources tfr ON tfr.recreation_resource_type_code = acv.rec_resource_type_code
    GROUP BY acv.rec_resource_type_code, acv.description
    ORDER BY acv.rec_resource_type_code DESC
  ),
  status_counts AS (
    SELECT
      'open' AS code,
      'Open' AS description,
      CASE
        WHEN ${filterTypes?.isOnlyStatusFilter ?? false} THEN (
          SELECT COUNT(*) FROM recreation_resource_search_view rrsv
          WHERE ${
            useAdvisoryStatus
              ? Prisma.sql`(
                NOT EXISTS (
                  SELECT 1 FROM rst.act_advisories_flat aaf
                  WHERE aaf.rec_resource_id = rrsv.rec_resource_id AND aaf.published_at IS NOT NULL
                )
                OR (
                  SELECT (array_agg(aaf.access_status_grouplabel ORDER BY aaf.listing_rank DESC, aaf.urgency_sequence DESC, aaf.access_status_precedence ASC, aaf.updated_date DESC, aaf.advisory_date DESC, aaf.event_type_precedence ASC))[1]
                  FROM rst.act_advisories_flat aaf
                  WHERE aaf.rec_resource_id = rrsv.rec_resource_id AND aaf.published_at IS NOT NULL
                ) = ANY(ARRAY['Open', 'Seasonal restrictions', 'Visit with caution', 'Limited access'])
              )`
              : Prisma.sql`((recreation_status->>'status_code')::int != 2 OR recreation_status IS NULL)`
          } ${extraFilters}
        )::INT
        ELSE (
          SELECT COUNT(*) FROM filtered_resources fr
          WHERE ${
            useAdvisoryStatus
              ? Prisma.sql`(
                NOT EXISTS (
                  SELECT 1 FROM rst.act_advisories_flat aaf
                  WHERE aaf.rec_resource_id = fr.rec_resource_id AND aaf.published_at IS NOT NULL
                )
                OR (
                  SELECT (array_agg(aaf.access_status_grouplabel ORDER BY aaf.listing_rank DESC, aaf.urgency_sequence DESC, aaf.access_status_precedence ASC, aaf.updated_date DESC, aaf.advisory_date DESC, aaf.event_type_precedence ASC))[1]
                  FROM rst.act_advisories_flat aaf
                  WHERE aaf.rec_resource_id = fr.rec_resource_id AND aaf.published_at IS NOT NULL
                ) = ANY(ARRAY['Open', 'Seasonal restrictions', 'Visit with caution', 'Limited access'])
              )`
              : Prisma.sql`((fr.recreation_status->>'status_code')::int != 2 OR fr.recreation_status IS NULL)`
          }
        )::INT
      END AS count
    UNION ALL
    SELECT
      'closed' AS code,
      'Closed' AS description,
      CASE
        WHEN ${filterTypes?.isOnlyStatusFilter ?? false} THEN (
          SELECT COUNT(*) FROM recreation_resource_search_view rrsv
          WHERE ${
            useAdvisoryStatus
              ? Prisma.sql`(
                SELECT (array_agg(aaf.access_status_grouplabel ORDER BY aaf.listing_rank DESC, aaf.urgency_sequence DESC, aaf.access_status_precedence ASC, aaf.updated_date DESC, aaf.advisory_date DESC, aaf.event_type_precedence ASC))[1]
                FROM rst.act_advisories_flat aaf
                WHERE aaf.rec_resource_id = rrsv.rec_resource_id AND aaf.published_at IS NOT NULL
              ) = ANY(ARRAY['Closed', 'Restricted'])`
              : Prisma.sql`(recreation_status->>'status_code')::int = 2`
          } ${extraFilters}
        )::INT
        ELSE (
          SELECT COUNT(*) FROM filtered_resources fr
          WHERE ${
            useAdvisoryStatus
              ? Prisma.sql`(
                SELECT (array_agg(aaf.access_status_grouplabel ORDER BY aaf.listing_rank DESC, aaf.urgency_sequence DESC, aaf.access_status_precedence ASC, aaf.updated_date DESC, aaf.advisory_date DESC, aaf.event_type_precedence ASC))[1]
                FROM rst.act_advisories_flat aaf
                WHERE aaf.rec_resource_id = fr.rec_resource_id AND aaf.published_at IS NOT NULL
              ) = ANY(ARRAY['Closed', 'Restricted'])`
              : Prisma.sql`(fr.recreation_status->>'status_code')::int = 2`
          }
        )::INT
      END AS count
  ),
  fees_counts AS (
    SELECT
      CASE
        WHEN ${filterTypes?.isOnlyFeesFilter ?? false} THEN (
          SELECT COUNT(*) FROM recreation_resource_search_view
          WHERE is_reservable = true ${extraFilters}
        )::INT
        ELSE COALESCE(SUM(CASE WHEN is_reservable = true THEN 1 ELSE 0 END), 0)::INT
      END AS reservable_count,
      CASE
        WHEN ${filterTypes?.isOnlyFeesFilter ?? false} THEN (
          SELECT COUNT(*) FROM recreation_resource_search_view
          WHERE is_fees = true ${extraFilters}
        )::INT
        ELSE COALESCE(SUM(CASE WHEN is_fees = true THEN 1 ELSE 0 END), 0)::INT
      END AS fees_count,
      CASE
        WHEN ${filterTypes?.isOnlyFeesFilter ?? false} THEN (
          SELECT COUNT(*) FROM recreation_resource_search_view
          WHERE (is_fees = false OR is_fees IS NULL) ${extraFilters}
        )::INT
        ELSE COALESCE(SUM(CASE WHEN (is_fees = false OR is_fees IS NULL) THEN 1 ELSE 0 END), 0)::INT
      END AS no_fees_count
    FROM filtered_resources
  ),
  extent_calc AS (
    SELECT
      public.ST_Extent(recreation_site_point) AS extent_geom
    FROM recreation_resource_search_view rrsv
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

  SELECT
    'status', sc.code, sc.description, sc.count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM status_counts sc

  UNION ALL

  SELECT 'fees', 'R', 'Reservable', reservable_count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM fees_counts

  UNION ALL

  SELECT 'fees', 'F', 'Fees apply', fees_count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM fees_counts

  UNION ALL

  SELECT 'fees', 'NF', 'No fees', no_fees_count, NULL::TEXT[] AS rec_resource_ids, NULL::TEXT AS extent
  FROM fees_counts

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

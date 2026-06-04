import { Prisma } from '@generated/prisma';
import {
  buildFuzzySearchScore,
  buildFuzzySearchOrdering,
} from './fuzzySearchUtils';

interface RecreationResourcePageQueryParams {
  whereClause: Prisma.Sql;
  take: number;
  skip: number;
  lat?: number;
  lon?: number;
  searchText?: string;
}

export function buildRecreationResourcePageQuery({
  whereClause,
  take,
  skip,
  lat,
  lon,
  searchText,
}: RecreationResourcePageQueryParams): Prisma.Sql {
  const hasLocation = typeof lat === 'number' && typeof lon === 'number';

  // Distance is used for sorting and is only calculated if lat/lon are provided
  const distanceSql = hasLocation
    ? Prisma.sql`, public.ST_Distance(
      recreation_site_point,
      public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005)
    ) as distance`
    : Prisma.empty;

  // Add fuzzy search scoring if searchText is provided
  const fuzzyScoreSql = buildFuzzySearchScore(searchText);
  const orderBySql = buildFuzzySearchOrdering(searchText, hasLocation);

  return Prisma.sql`
    select rrsv.rec_resource_id,
           rrsv.name,
           rrsv.closest_community,
           rrsv.display_on_public_site,
           rrsv.recreation_resource_type,
           rrsv.recreation_resource_type_code,
           rrsv.recreation_activity,
           rrsv.recreation_status,
           rrsv.recreation_resource_images,
           rrsv.district_code,
           rrsv.district_description,
           rrsv.access_code,
           rrsv.access_description,
           rrsv.recreation_structure,
           rrsv.has_toilets,
           rrsv.has_tables,
           count(*) over()::int AS total_count,
           adv.advisory_count,
           adv.top_access_status_grouplabel
           ${distanceSql}
           ${fuzzyScoreSql}
    from recreation_resource_search_view rrsv
    left join lateral (
      select
        count(*)::int as advisory_count,
        (array_agg(access_status_grouplabel order by access_status_precedence asc))[1] as top_access_status_grouplabel
      from rst.act_advisories_flat
      where rec_resource_id = rrsv.rec_resource_id
        and published_at is not null
    ) adv on true
    ${whereClause} ${orderBySql}
    limit ${take}
    offset ${skip};
  `;
}

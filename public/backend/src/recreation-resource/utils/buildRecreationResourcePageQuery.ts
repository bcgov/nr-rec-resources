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
    select rec_resource_id,
           name,
           closest_community,
           display_on_public_site,
           recreation_resource_type,
           recreation_resource_type_code,
           recreation_activity,
           recreation_status,
           recreation_resource_images,
           district_code,
           district_description,
           access_code,
           access_description,
           recreation_structure,
           has_toilets,
           has_tables,
           count(*) over()::int AS total_count
           ${distanceSql}
           ${fuzzyScoreSql}
    from recreation_resource_search_view ${whereClause} ${orderBySql}
    limit ${take}
    offset ${skip};
  `;
}

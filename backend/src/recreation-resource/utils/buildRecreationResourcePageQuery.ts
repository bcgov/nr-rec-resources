import { Prisma } from "@prisma/client";

interface RecreationResourcePageQueryParams {
  whereClause: Prisma.Sql;
  take: number;
  skip: number;
  lat?: number;
  lon?: number;
}

export function buildRecreationResourcePageQuery({
  whereClause,
  take,
  skip,
  lat,
  lon,
}: RecreationResourcePageQueryParams): Prisma.Sql {
  const hasLocation = typeof lat === "number" && typeof lon === "number";

  // Distance is used for sorting and is only calculated if lat/lon are provided
  const distanceSql = hasLocation
    ? Prisma.sql`, public.ST_Distance(
      public.ST_Transform(public.ST_SetSRID(recreation_site_point, 3005), 3005),
      public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005)
    ) as distance`
    : Prisma.empty;

  const orderBySql = hasLocation
    ? Prisma.sql`order by distance asc, name asc`
    : Prisma.sql`order by name asc`;

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
    from recreation_resource_search_view ${whereClause} ${orderBySql}
    limit ${take}
    offset ${skip};
  `;
}

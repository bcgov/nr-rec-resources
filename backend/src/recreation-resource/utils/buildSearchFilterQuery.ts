import { Prisma } from "@prisma/client";

export interface FilterOptions {
  filter?: string;
  activities?: string;
  type?: string;
  district?: string;
  access?: string;
  facilities?: string;
  lat?: number;
  lon?: number;
}

// const radiusInMeters = 50000; // 50 km radius
const radiusInMeters = 1500000; // 2000 km radius

// Build where clause for search filter query
export const buildSearchFilterQuery = ({
  filter,
  activities,
  type,
  district,
  access,
  facilities,
  lat,
  lon,
}: FilterOptions): Prisma.Sql => {
  const activityFilter = activities?.split("_").map(Number) ?? [];
  const typeFilter = type?.split("_").map(String) ?? [];
  const districtFilter = district?.split("_").map(String) ?? [];
  const accessFilter = access?.split("_").map(String) ?? [];
  const facilityFilter = facilities?.split("_").map(String) ?? [];

  const filterQuery = Prisma.sql`(name ilike ${"%" + filter + "%"} or closest_community ilike ${"%" + filter + "%"})`;

  const accessFilterQuery =
    accessFilter.length > 0
      ? Prisma.sql`and access_code in (${Prisma.join(accessFilter)})`
      : Prisma.empty;

  const districtFilterQuery =
    districtFilter.length > 0
      ? Prisma.sql`and district_code in (${Prisma.join(districtFilter)})`
      : Prisma.empty;

  const typeFilterQuery =
    typeFilter.length > 0
      ? Prisma.sql`and recreation_resource_type_code in (${Prisma.join(typeFilter)})`
      : Prisma.empty;

  const activityFilterQuery =
    Array.isArray(activityFilter) && activityFilter.length > 0
      ? Prisma.sql`
        and (
          select count(*)
          from jsonb_array_elements(recreation_activity) AS activity
          where (activity->>'recreation_activity_code')::bigint in (${Prisma.join(activityFilter)})
        ) = ${activityFilter.length}
    `
      : Prisma.empty;

  const facilityFilterQuery =
    Array.isArray(facilityFilter) && facilityFilter.length > 0
      ? Prisma.sql`and (
          select count(*)
          from jsonb_array_elements(recreation_structure) AS facility
          where (
            ${Prisma.join(
              facilityFilter.map(
                (f) =>
                  Prisma.sql`(facility->>'description') ilike ${"%" + f + "%"}`,
              ),
              " or ",
            )}
          )
      ) > 0`
      : Prisma.empty;

  const locationFilterQuery =
    typeof lat === "number" && typeof lon === "number"
      ? Prisma.sql`and public.ST_DWithin(
        public.ST_SetSRID(recreation_site_point, 4326),
        public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326),
        ${radiusInMeters}
      )`
      : Prisma.empty;

  return Prisma.sql`
    where
      ${filterQuery}
      ${accessFilterQuery}
      ${districtFilterQuery}
      ${typeFilterQuery}
      ${activityFilterQuery}
      ${facilityFilterQuery}
      ${locationFilterQuery}
  `;
};

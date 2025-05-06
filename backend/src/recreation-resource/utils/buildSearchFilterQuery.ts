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
  radius?: number;
}

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
  radius = 50000, // Default to 50 km if not provided
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
      ? Prisma.sql`AND public.ST_DWithin(
        public.ST_Transform(public.ST_SetSRID(recreation_site_point, 3005), 3005),
        public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005),
        ${radius}
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

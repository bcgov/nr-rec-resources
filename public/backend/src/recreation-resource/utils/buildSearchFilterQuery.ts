import { Prisma } from "@prisma/client";

export interface FilterOptions {
  searchText?: string;
  activities?: string;
  type?: string;
  district?: string;
  access?: string;
  facilities?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}

const RADIUS = 50000; // 50 km

// Build where clause for search filter query
export const buildSearchFilterQuery = ({
  searchText,
  activities,
  type,
  district,
  access,
  facilities,
  lat,
  lon,
}: FilterOptions) => {
  const activityFilter = activities?.split("_").map(Number) ?? [];
  const typeFilter = type?.split("_").map(String) ?? [];
  const districtFilter = district?.split("_").map(String) ?? [];
  const accessFilter = access?.split("_").map(String) ?? [];
  const facilityFilter = facilities?.split("_").map(String) ?? [];

  // Conditional filter for searchText
  const textSearchFilterQuery = searchText
    ? Prisma.sql`(name ilike ${"%" + searchText + "%"} or closest_community ilike ${"%" + searchText + "%"})`
    : Prisma.empty;

  const accessFilterQuery =
    accessFilter.length > 0
      ? Prisma.sql`access_code in (${Prisma.join(accessFilter)})`
      : Prisma.empty;

  const districtFilterQuery =
    districtFilter.length > 0
      ? Prisma.sql`district_code in (${Prisma.join(districtFilter)})`
      : Prisma.empty;

  const typeFilterQuery =
    typeFilter.length > 0
      ? Prisma.sql`recreation_resource_type_code in (${Prisma.join(typeFilter)})`
      : Prisma.empty;

  const activityFilterQuery =
    Array.isArray(activityFilter) && activityFilter.length > 0
      ? Prisma.sql`
        (
          select count(*)
          from jsonb_array_elements(recreation_activity) AS activity
          where (activity->>'recreation_activity_code')::bigint in (${Prisma.join(
            activityFilter,
          )})
        ) = ${activityFilter.length}
    `
      : Prisma.empty;

  // uses AND to require all requested facilities to be present
  const facilityFilterQuery =
    Array.isArray(facilityFilter) && facilityFilter.length > 0
      ? Prisma.sql`(
        SELECT COUNT(*)
        FROM (
          SELECT rec_resource_id
          FROM jsonb_array_elements(recreation_structure) AS facility
          GROUP BY rec_resource_id
          HAVING ${Prisma.join(
            facilityFilter.map(
              (f) => Prisma.sql`
                COUNT(*) FILTER (
                  WHERE facility->>'description' ILIKE ${"%" + f + "%"}
                ) > 0
              `,
            ),
            " AND ",
          )}
        ) AS filtered_resources
      ) > 0`
      : Prisma.empty;

  const locationFilterQuery =
    typeof lat === "number" && typeof lon === "number"
      ? Prisma.sql`public.ST_DWithin(
        recreation_site_point,
        public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005),
        ${RADIUS}
      )`
      : Prisma.empty;

  const conditions = [
    textSearchFilterQuery,
    accessFilterQuery,
    districtFilterQuery,
    typeFilterQuery,
    activityFilterQuery,
    facilityFilterQuery,
    locationFilterQuery,
  ].filter((sql) => sql !== Prisma.empty); // Remove empty conditions

  return conditions.length
    ? Prisma.sql`where ${Prisma.join(conditions, " and ")}`
    : Prisma.empty;
};

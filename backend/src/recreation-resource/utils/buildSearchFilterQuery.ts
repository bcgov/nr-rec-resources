import { Prisma } from "@prisma/client";

export interface FilterOptions {
  filter?: string;
  activities?: string;
  type?: string;
  district?: string;
  access?: string;
  facilities?: string;
}

export const buildSearchFilterQuery = ({
  filter,
  activities,
  type,
  district,
  access,
  facilities,
}: {
  filter: string;
  activities?: string;
  type?: string;
  district?: string;
  access?: string;
  facilities?: string;
}) => {
  const activityFilter = activities?.split("_").map(Number) ?? [];
  const typeFilter = type?.split("_").map(String) ?? [];
  const districtFilter = district?.split("_").map(String) ?? [];
  const accessFilter = access?.split("_").map(String) ?? [];
  const facilityFilter = facilities?.split("_").map(String) ?? [];

  const filterQuery = Prisma.sql`(name ilike ${"%" + filter + "%"} or closest_community ilike ${"%" + filter + "%"})`;

  const accessFilterQuery =
    accessFilter.length > 0
      ? Prisma.sql`and access_code in (${Prisma.join(accessFilter)})`
      : Prisma.sql``;

  const districtFilterQuery =
    districtFilter.length > 0
      ? Prisma.sql`and district_code in (${Prisma.join(districtFilter)})`
      : Prisma.sql``;

  const typeFilterQuery =
    typeFilter.length > 0
      ? Prisma.sql`and recreation_resource_type_code in (${Prisma.join(typeFilter)})`
      : Prisma.sql``;

  const activityFilterQuery =
    Array.isArray(activityFilter) && activityFilter.length > 0
      ? Prisma.sql`and (
            select count(*)
            from jsonb_array_elements(recreation_activity) as activity
            where (activity->>'recreation_activity_code')::bigint in (${Prisma.join(activityFilter)})
        ) > 0`
      : Prisma.sql``;

  const facilityFilterQuery =
    Array.isArray(facilityFilter) && facilityFilter.length > 0
      ? Prisma.sql`and (
            select count(*)
            from jsonb_array_elements(recreation_structure) AS facility
            where ${Prisma.join(facilityFilter.map((f) => Prisma.sql`(facility->>'description') ilike ${"%" + f + "%"}`))}
        ) > 0`
      : Prisma.sql``;

  return Prisma.sql`
    where 
      ${filterQuery}
      ${accessFilterQuery}
      ${districtFilterQuery}
      ${typeFilterQuery}
      ${activityFilterQuery}
      ${facilityFilterQuery}
  `;
};

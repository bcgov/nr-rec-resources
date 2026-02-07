import { Prisma } from '@prisma/client';
import { buildFuzzySearchConditions } from './fuzzySearchUtils';

export interface FilterOptions {
  searchText?: string;
  activities?: string;
  type?: string;
  district?: string;
  access?: string;
  facilities?: string;
  status?: string;
  fees?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}

export interface ExcludeOptions {
  type?: boolean;
  district?: boolean;
}

const RADIUS = 50000; // 50 km

// Build where clause for search filter query
const buildFilterConditions = (
  options: FilterOptions,
  exclude?: ExcludeOptions,
) => {
  const {
    searchText,
    activities,
    type,
    district,
    access,
    facilities,
    status,
    fees,
    lat,
    lon,
  } = options;

  const activityFilter = activities?.split('_').map(Number) ?? [];
  const typeFilter = type?.split('_').map(String) ?? [];
  const districtFilter = district?.split('_').map(String) ?? [];
  const accessFilter = access?.split('_').map(String) ?? [];
  const facilityFilter = facilities?.split('_').map(String) ?? [];
  const statusFilter = status?.split('_').map(String) ?? [];
  const feesFilter = fees?.split('_').map(String) ?? [];

  // Conditional filter for searchText with fuzzy search
  const displayOnPublicSite = Prisma.sql`display_on_public_site is true`;
  const textSearchFilterQuery = buildFuzzySearchConditions(searchText);

  const accessFilterQuery =
    accessFilter.length > 0
      ? Prisma.sql`access_code in (${Prisma.join(accessFilter)})`
      : Prisma.empty;

  const districtFilterQuery =
    !exclude?.district && districtFilter.length > 0
      ? Prisma.sql`district_code in (${Prisma.join(districtFilter)})`
      : Prisma.empty;

  const typeFilterQuery =
    !exclude?.type && typeFilter.length > 0
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
                  WHERE facility->>'description' ILIKE ${'%' + f + '%'}
                ) > 0
              `,
            ),
            ' AND ',
          )}
        ) AS filtered_resources
      ) > 0`
      : Prisma.empty;

  // Resources with null status are considered "Open"
  const statusFilterQuery =
    statusFilter.length > 0
      ? Prisma.sql`(${Prisma.join(
          statusFilter.map((status) => {
            const lowerStatus = status.toLowerCase();
            if (lowerStatus === 'open') {
              return Prisma.sql`(recreation_status IS NULL OR recreation_status->>'description' IS NULL OR recreation_status->>'description' ILIKE ${status})`;
            } else {
              return Prisma.sql`recreation_status->>'description' ILIKE ${status}`;
            }
          }),
          ' OR ',
        )})`
      : Prisma.empty;

  // Fees filter using is_fees and is_reservable columns
  // Reservable (R), Fees (F), No fees (NF)
  const feesFilterQuery =
    feesFilter.length > 0
      ? Prisma.sql`(${Prisma.join(
          feesFilter.map((feeType) => {
            const upperFeeType = feeType.toUpperCase();
            if (upperFeeType === 'R') {
              return Prisma.sql`is_reservable = true`;
            } else if (upperFeeType === 'F') {
              return Prisma.sql`is_fees = true`;
            } else if (upperFeeType === 'NF') {
              return Prisma.sql`(is_fees = false OR is_fees IS NULL)`;
            } else {
              return Prisma.empty;
            }
          }),
          ' OR ',
        )})`
      : Prisma.empty;

  const locationFilterQuery =
    typeof lat === 'number' && typeof lon === 'number'
      ? Prisma.sql`public.ST_DWithin(
        recreation_site_point,
        public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(${lon}, ${lat}), 4326), 3005),
        ${RADIUS}
      )`
      : Prisma.empty;

  const conditions = [
    displayOnPublicSite,
    textSearchFilterQuery,
    accessFilterQuery,
    districtFilterQuery,
    typeFilterQuery,
    activityFilterQuery,
    facilityFilterQuery,
    statusFilterQuery,
    feesFilterQuery,
    locationFilterQuery,
  ].filter((sql) => sql !== Prisma.empty); // Remove empty conditions

  return conditions;
};

// Build where clause for search filter query
export const buildSearchFilterQuery = (
  options: FilterOptions,
  exclude?: ExcludeOptions,
) => {
  const conditions = buildFilterConditions(options, exclude);
  return conditions.length
    ? Prisma.sql`where ${Prisma.join(conditions, ' and ')}`
    : Prisma.empty;
};

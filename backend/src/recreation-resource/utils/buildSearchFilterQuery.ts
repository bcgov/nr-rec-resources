import { Prisma } from "@prisma/client";
import {
  EXCLUDED_RECREATION_DISTRICTS,
  EXCLUDED_RESOURCE_TYPES,
} from "src/recreation-resource/constants/service.constants";

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
}: FilterOptions): Prisma.recreation_resourceWhereInput => {
  const activityFilter = activities?.split("_").map(Number);
  const typeFilter = type?.split("_").map(String);
  const districtFilter = district?.split("_").map(String);
  const accessFilter = access?.split("_").map(String);
  const facilityFilter = facilities?.split("_").map(String);

  const activityFilterQuery = activities && {
    AND: activityFilter.map((activity) => ({
      recreation_activity: {
        some: {
          recreation_activity_code: activity,
        },
      },
    })),
  };

  const accessFilterQuery = access && {
    recreation_access: {
      some: {
        access_code: {
          in: accessFilter,
        },
      },
    },
  };

  const resourceTypeFilterQuery = type && {
    in: typeFilter,
  };

  const districtFilterQuery = district && {
    district_code: {
      in: districtFilter,
    },
  };

  const facilityFilterQuery = facilities && {
    AND: facilityFilter.map((facility) => ({
      recreation_structure: {
        some: {
          recreation_structure_code: {
            description: {
              contains: facility,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      },
    })),
  };

  return {
    OR: [
      { name: { contains: filter, mode: Prisma.QueryMode.insensitive } },
      {
        closest_community: {
          contains: filter,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ],
    AND: [
      { display_on_public_site: true },
      {
        recreation_resource_type: {
          rec_resource_type_code: {
            notIn: EXCLUDED_RESOURCE_TYPES,
            ...resourceTypeFilterQuery,
          },
        },
      },
      {
        district_code: {
          notIn: EXCLUDED_RECREATION_DISTRICTS,
        },
      },
      accessFilterQuery,
      districtFilterQuery,
      activityFilterQuery,
      facilityFilterQuery,
    ].filter(Boolean),
  };
};

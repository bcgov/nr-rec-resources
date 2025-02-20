import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";

const excludedActivityCodes = [26];
const excludedResourceTypes = ["RR"];
// Only tables and toilets are included in the facilities filter
const includedStructureCodes = [1, 2, 3, 4, 48, 49, 50, 51, 52];

const recreationResourceSelect = {
  rec_resource_id: true,
  description: true,
  name: true,
  closest_community: true,
  display_on_public_site: true,
  recreation_resource_type: {
    select: {
      recreation_resource_type_code: true,
    },
  },

  recreation_activity: {
    select: {
      recreation_activity: true,
    },
  },
  campsite_count: true,
  recreation_status: {
    select: {
      recreation_status_code: {
        select: {
          description: true,
        },
      },
      comment: true,
      status_code: true,
    },
  },
};

type RecreationResourceGetPayload = Prisma.recreation_resourceGetPayload<{
  select: typeof recreationResourceSelect;
}>;

@Injectable()
export class RecreationResourceService {
  constructor(private prisma: PrismaService) { }

  // Format the results to match the DTO
  formatResults(recResources: RecreationResourceGetPayload[]) {
    return recResources?.map((resource) => ({
      ...resource,
      rec_resource_type:
        resource?.recreation_resource_type.recreation_resource_type_code
          .description,
      recreation_activity: resource.recreation_activity?.map((activity) => ({
        description: activity.recreation_activity.description,
        recreation_activity_code:
          activity.recreation_activity.recreation_activity_code,
      })),
      recreation_status: {
        description:
          resource.recreation_status?.recreation_status_code.description,
        comment: resource.recreation_status?.comment,
        status_code: resource.recreation_status?.status_code,
      },
    }));
  }

  async findOne(id: string): Promise<RecreationResourceDto> {
    const recResource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id: id,
        AND: {
          display_on_public_site: true,
        },
      },
      select: recreationResourceSelect,
    });

    return recResource ? this.formatResults([recResource])[0] : null;
  }

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
    limit?: number,
    activities?: string,
    type?: string,
    district?: string,
    access?: string,
    facilities?: string,
  ): Promise<PaginatedRecreationResourceDto> {
    // 10 page limit - max 100 records since if no limit we fetch page * limit
    if (page > 10 && !limit) {
      throw new Error("Maximum page limit is 10 when no limit is provided");
    }

    // 10 is the maximum limit
    if (limit && limit > 10) {
      limit = 10;
    }

    // If only page is provided, we will return all records up to the end of that page
    // If limit is provided, we will return that many paginated records for lazy loading
    const take = limit ? limit : 10 * page;
    const skip = limit ? (page - 1) * limit : 0;
    const orderBy = [{ name: Prisma.SortOrder.asc }];
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
        every: {
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
      recreation_structure: {
        structure_code: {
          in: facilityFilter,
        },
      },
    };

    const where = {
      OR: [
        { name: { contains: filter, mode: Prisma.QueryMode.insensitive } },
        {
          closest_community: {
            contains: filter,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
      AND: {
        display_on_public_site: true,
        recreation_resource_type: {
          rec_resource_type_code: {
            notIn: excludedResourceTypes,
            ...resourceTypeFilterQuery,
          },
        },
        ...activityFilterQuery,
        ...accessFilterQuery,
        ...districtFilterQuery,
      },
    };

    const [
      recreationResources,
      totalRecordIds,
      recResourceTypeCounts,
      recreationDistrictCounts,
      recreationAccessCounts,
    ] = await this.prisma.$transaction([
      // Fetch paginated records
      this.prisma.recreation_resource.findMany({
        where,
        select: recreationResourceSelect,
        take,
        skip,
        orderBy,
      }),
      // Get all unpaginated but filtered rec_resource_ids for the records so we can group/count records for the filter sidebar
      // This can be used to get the count of each many to many filter group
      this.prisma.recreation_resource.findMany({
        where,
        select: { rec_resource_id: true },
      }),
      // Get counts for all, unfiltered resource types that are in the records
      this.prisma.recreation_resource_type_code.findMany({
        select: {
          rec_resource_type_code: true,
          description: true,
          _count: {
            select: {
              recreation_resource_type: true, // Count related recreation resources
            },
          },
        },
        where: {
          rec_resource_type_code: {
            notIn: excludedResourceTypes,
          },
        },
        orderBy: {
          description: Prisma.SortOrder.desc,
        },
      }),
      // Get counts for all, unfiltered recreation_districts that are in the records
      this.prisma.recreation_district_code.findMany({
        select: {
          district_code: true,
          description: true,
          _count: {
            select: {
              recreation_resource: {
                where: {
                  display_on_public_site: {
                    equals: true,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          description: Prisma.SortOrder.asc,
        },
      }),
      this.prisma.recreation_access_code.findMany({
        select: {
          access_code: true,
          description: true,
          _count: {
            select: {
              recreation_access: {
                where: {
                  recreation_resource: {
                    display_on_public_site: {
                      equals: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const facilityCounts = await this.prisma.recreation_structure_code.findMany(
      {
        select: {
          structure_code: true,
          description: true,
          _count: {
            select: {
              recreation_structure: {
                where: {
                  rec_resource_id: {
                    in: totalRecordIds?.map((record) => record.rec_resource_id),
                  },
                },
              },
            },
          },
        },
        where: {
          structure_code: {
            in: includedStructureCodes,
          },
        },
      },
    );

    const activityCounts = await this.prisma.recreation_activity_code.findMany({
      select: {
        recreation_activity_code: true,
        description: true,
        _count: {
          select: {
            recreation_activity: {
              where: {
                rec_resource_id: {
                  in: totalRecordIds?.map((record) => record.rec_resource_id),
                },
              },
            },
          },
        },
      },
    });

    const getUniqueFacilityCounts = (facilityCounts) => {
      let toiletCount = 0;
      let tableCount = 0;
      facilityCounts.map((facility) => {
        if (facility.description.toLowerCase().includes("toilet")) {
          toiletCount += facility._count.recreation_structure;
        } else if (facility.description.toLowerCase().includes("table")) {
          tableCount += facility._count.recreation_structure;
        }
      });
      return [
        {
          id: "toilet",
          description: "Toilet",
          count: toiletCount,
        },
        {
          id: "table",
          description: "Table",
          count: tableCount,
        },
      ];
    };

    const activityFilters = activityCounts.map((activity) => ({
      id: activity.recreation_activity_code,
      description: activity.description,
      count: activity._count.recreation_activity ?? 0,
    }));

    const recResourceTypeFilters = recResourceTypeCounts.map(
      (resourceType) => ({
        id: resourceType.rec_resource_type_code,
        description: resourceType.description,
        count: resourceType._count.recreation_resource_type ?? 0,
      }),
    );

    const recreationDistrictFilters = recreationDistrictCounts.map(
      (district) => ({
        id: district.district_code,
        description: district.description,
        count: district._count.recreation_resource ?? 0,
      }),
    );

    const recreationAccessFilters = recreationAccessCounts.map((access) => ({
      id: access.access_code,
      description: access.description,
      count: access._count.recreation_access ?? 0,
    }));

    return {
      data: this.formatResults(recreationResources),
      page,
      limit,
      total: totalRecordIds?.length,
      filters: [
        {
          type: "multi-select",
          label: "District",
          param: "district",
          options: recreationDistrictFilters,
        },
        {
          type: "multi-select",
          label: "Type",
          param: "type",
          options: recResourceTypeFilters,
        },
        {
          type: "multi-select",
          label: "Things to do",
          param: "activities",
          options: activityFilters,
        },
        {
          type: "multi-select",
          label: "Facilities",
          param: "facilities",
          options: getUniqueFacilityCounts(facilityCounts),
        },
        {
          type: "multi-select",
          label: "Access Type",
          param: "access",
          options: recreationAccessFilters,
        },
      ],
    };
  }
}

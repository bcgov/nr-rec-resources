import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";

const excludedActivityCodes = [26];
const excludedResourceTypes = ["RR"];

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
  recreation_campsite: true,
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
  recreation_fee: {
    select: {
      fee_amount: true,
      fee_start_date: true,
      fee_end_date: true,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: true,
      sunday_ind: true,
      recreation_fee_code: true,
      with_description: {
        select: {
          description: true,
        },
      },
    },
  },
};

const activitySelect = {
  recreation_activity_code: true,
  recreation_activity: {
    select: {
      description: true,
    },
  },
};

type RecreationResourceGetPayload = Prisma.recreation_resourceGetPayload<{
  select: typeof recreationResourceSelect;
}>;

type ActivityGetPayload = Prisma.recreation_activityGetPayload<{
  select: typeof activitySelect;
}>;

@Injectable()
export class RecreationResourceService {
  constructor(private prisma: PrismaService) {}

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
      recreation_fee: resource.recreation_fee
        ? {
            fee_amount: resource.recreation_fee.fee_amount,
            fee_start_date: resource.recreation_fee.fee_start_date,
            fee_end_date: resource.recreation_fee.fee_end_date,
            monday_ind: resource.recreation_fee.monday_ind,
            tuesday_ind: resource.recreation_fee.tuesday_ind,
            wednesday_ind: resource.recreation_fee.wednesday_ind,
            thursday_ind: resource.recreation_fee.thursday_ind,
            friday_ind: resource.recreation_fee.friday_ind,
            saturday_ind: resource.recreation_fee.saturday_ind,
            sunday_ind: resource.recreation_fee.sunday_ind,
            recreation_fee_code: resource.recreation_fee.recreation_fee_code,
            fee_description:
              resource.recreation_fee.with_description?.description,
          }
        : null,
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

  async getActivityCounts(totalRecordIds: { rec_resource_id: string }[]) {
    const groupActivitiesQuery = this.prisma.recreation_activity.groupBy({
      by: ["recreation_activity_code"],
      _count: {
        recreation_activity_code: true,
      },
      where: {
        rec_resource_id: {
          in: totalRecordIds?.map((record) => record.rec_resource_id),
        },
      },
    });

    const allActivityCodesQuery = this.prisma.recreation_activity.findMany({
      select: activitySelect,
      where: {
        NOT: {
          recreation_activity_code: {
            in: excludedActivityCodes,
          },
        },
      },
      distinct: ["recreation_activity_code"],
    });

    const [allActivityCodes, groupActivities] = await this.prisma.$transaction([
      allActivityCodesQuery,
      groupActivitiesQuery,
    ]);
    // Merge and include missing entries with a count of 0
    const activityCount = allActivityCodes?.map(
      (activity: ActivityGetPayload) => {
        const matchedGroup = groupActivities.find(
          (group: { recreation_activity_code: number }) =>
            group.recreation_activity_code ===
            activity.recreation_activity_code,
        );
        return {
          id: activity.recreation_activity_code,
          count: matchedGroup
            ? matchedGroup._count.recreation_activity_code
            : 0,
          description: activity.recreation_activity.description,
        };
      },
    );

    return activityCount;
  }

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
    limit?: number,
    activities?: string,
    type?: string,
    district?: string,
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

    const activityFilterQuery = activities && {
      AND: activityFilter.map((activity) => ({
        recreation_activity: {
          some: {
            recreation_activity_code: activity,
          },
        },
      })),
    };

    const resourceTypeFilterQuery = type && {
      in: typeFilter,
    };

    const districtFilterQuery = district && {
      district_code: {
        in: districtFilter,
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
        ...districtFilterQuery,
      },
    };

    const [
      recreationResources,
      totalRecordIds,
      recResourceTypeCounts,
      recreationDistrictCounts,
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
      // @ts-ignore
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
              recreation_resource: true, // Count related recreation resources
            },
          },
        },
        orderBy: {
          description: Prisma.SortOrder.asc,
        },
      }),
    ]);

    const activityFilters = await this.getActivityCounts(totalRecordIds);

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
      ],
    };
  }
}

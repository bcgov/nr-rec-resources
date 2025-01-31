import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

const recreationResourceSelect = {
  rec_resource_id: true,
  description: true,
  name: true,
  site_location: true,
  display_on_public_site: true,
  recreation_activity: {
    select: {
      with_description: true,
    },
  },
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

const activitySelect = {
  recreation_activity_code: true,
  with_description: {
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
      recreation_activity: resource.recreation_activity?.map((activity) => ({
        description: activity.with_description.description,
        recreation_activity_code:
          activity.with_description.recreation_activity_code,
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

  async getActivityCounts(totalRecordIds: { rec_resource_id: string }[]) {
    const allActivityCodes = await this.prisma.recreation_activity.findMany({
      select: activitySelect,
      distinct: ["recreation_activity_code"],
    });

    // Fetch grouped activity counts
    const groupActivities = await this.prisma.recreation_activity.groupBy({
      by: ["recreation_activity_code"],
      _count: {
        recreation_activity_code: true,
      },
      where: {
        rec_resource_id: {
          in: totalRecordIds.map((record) => record.rec_resource_id),
        },
      },
    });

    // Merge and include missing entries with a count of 0
    const activityCount = allActivityCodes.map(
      (activity: ActivityGetPayload) => {
        const matchedGroup = groupActivities.find(
          (group) =>
            group.recreation_activity_code ===
            activity.recreation_activity_code,
        );
        return {
          id: activity.recreation_activity_code,
          count: matchedGroup
            ? matchedGroup._count.recreation_activity_code
            : 0,
          description: activity.with_description.description,
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

    // Filter by activities if provided
    const activityFilterQuery = activities && {
      AND: activityFilter.map((activity) => ({
        recreation_activity: {
          some: {
            recreation_activity_code: activity,
          },
        },
      })),
    };

    const filterQuery = {
      skip,
      take,
      orderBy,
      // If limit is provided, we will skip the records up to the end of the previous page
      where: {
        OR: [
          { name: { contains: filter, mode: Prisma.QueryMode.insensitive } },
          {
            site_location: {
              contains: filter,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
        AND: {
          display_on_public_site: true,
          ...activityFilterQuery,
        },
      },
      select: recreationResourceSelect,
    };

    const [recreationResources, totalRecordIds] =
      await this.prisma.$transaction([
        // Fetch paginated records
        this.prisma.recreation_resource.findMany(filterQuery),
        // Get all unpaginated rec_resource_ids for the records so we can group/count records for the filter sidebar
        // This can be used to get the count of each filter group
        this.prisma.recreation_resource.findMany({
          where: filterQuery.where,
          select: { rec_resource_id: true },
        }),
      ]);

    const activityFilters = await this.getActivityCounts(totalRecordIds);

    return {
      data: this.formatResults(recreationResources),
      page,
      limit,
      total: totalRecordIds.length,
      filters: [
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

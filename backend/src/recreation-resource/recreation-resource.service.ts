import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

interface RecreationActivityWithDescription {
  with_description: {
    description: string;
    recreation_activity_code: string;
  };
}

interface RecreationMapFeatureWithDescription {
  with_description: {
    description: string;
    recreation_map_feature_code: string;
  };
}

interface RecreationResource {
  rec_resource_id: string;
  name: string;
  description: string;
  site_location: string;
  recreation_activity: RecreationActivityWithDescription[];
  recreation_status: {
    recreation_status_code: {
      description: string;
    };
    comment: string;
    status_code: string;
  };
  recreation_map_feature: RecreationMapFeatureWithDescription[];
}

@Injectable()
export class RecreationResourceService {
  constructor(private prisma: PrismaService) {}

  // get recreation_activity and recreation_activity_code from recreation_resource
  recreationResourceSelect = {
    rec_resource_id: true,
    description: true,
    name: true,
    site_location: true,

    recreation_activity: {
      select: {
        // Join recreation_activity_code to get description
        with_description: true,
      },
    },
    recreation_map_feature: {
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

  // Format the results to match the DTO
  formatResults(recResources: RecreationResource[]): RecreationResourceDto[] {
    return recResources?.map((resource) => ({
      ...resource,
      recreation_activity: resource.recreation_activity?.map(
        (activity: RecreationActivityWithDescription) => ({
          description: activity.with_description.description,
          recreation_activity_code:
            activity.with_description.recreation_activity_code,
        }),
      ),
      recreation_status: {
        description:
          resource.recreation_status?.recreation_status_code.description,
        comment: resource.recreation_status?.comment,
        status_code: resource.recreation_status?.status_code,
      },
      recreation_map_feature:
        resource.recreation_map_feature?.length &&
        resource.recreation_map_feature[0]?.with_description
          ? {
              description:
                resource.recreation_map_feature[0].with_description
                  ?.description ?? null,
              recreation_map_feature_code:
                resource.recreation_map_feature[0].with_description
                  ?.recreation_map_feature_code ?? null,
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
      select: this.recreationResourceSelect,
    });

    return recResource ? this.formatResults([recResource])[0] : null;
  }

  async searchRecreationResources(
    page = 1,
    filter = "",
    limit?: number,
  ): Promise<PaginatedRecreationResourceDto> {
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 10;
    const MAX_PAGE_WITHOUT_LIMIT = 10;

    if (page < 1) {
      throw new BadRequestException("Page number must be at least 1");
    }
    if (limit !== undefined && limit < 1) {
      throw new BadRequestException("Limit must be at least 1");
    }

    if (limit === undefined && page > MAX_PAGE_WITHOUT_LIMIT) {
      throw new BadRequestException(
        `Maximum page limit is ${MAX_PAGE_WITHOUT_LIMIT} when no limit is provided`,
      );
    }

    if (limit !== undefined && limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    // If a limit is provided, we use it for lazy loading (skip & take).
    // Otherwise, we return all records up to the current page.
    const take = limit !== undefined ? limit : DEFAULT_LIMIT * page;
    const skip = limit !== undefined ? (page - 1) * limit : 0;

    // Build the filtering criteria.
    const where = {
      display_on_public_site: true,
      OR: [
        { name: { contains: filter, mode: Prisma.QueryMode.insensitive } },
        {
          site_location: {
            contains: filter,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };

    const orderBy = [{ name: Prisma.SortOrder.asc }];

    const [resources, total] = await Promise.all([
      this.prisma.recreation_resource.findMany({
        skip,
        take,
        orderBy,
        where,
        select: this.recreationResourceSelect,
      }),
      this.prisma.recreation_resource.count({ where }),
    ]);

    return {
      data: this.formatResults(resources),
      page,
      limit: limit ?? DEFAULT_LIMIT,
      total,
    };
  }
}

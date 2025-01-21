import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

interface RecreationActivityWithDescription {
  with_description: {
    description: string;
    recreation_activity_code: string;
  };
}

@Injectable()
export class RecreationResourceService {
  constructor(private prisma: PrismaService) {}

  // get recreation_activity and recreation_activity_code from recreation_resource
  recreationResourceSelect = {
    rec_resource_id: true,
    name: true,
    site_location: true,

    recreation_activity: {
      select: {
        // Join recreation_activity_code to get description
        with_description: true,
      },
    },
  };

  // Format the results to match the DTO due to many-to-many relationship
  formatResults(recResources: any[]): RecreationResourceDto[] {
    return recResources?.map((resource) => ({
      ...resource,
      recreation_activity: resource.recreation_activity.map(
        (activity: RecreationActivityWithDescription) => ({
          description: activity.with_description.description,
          recreation_activity_code:
            activity.with_description.recreation_activity_code,
        }),
      ),
    }));
  }

  async findAll(): Promise<RecreationResourceDto[]> {
    const recResources = await this.prisma.recreation_resource.findMany({
      select: this.recreationResourceSelect,
    });

    return this.formatResults(recResources);
  }

  async findOne(id: string): Promise<RecreationResourceDto> {
    const recResource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id: id,
      },
      select: this.recreationResourceSelect,
    });

    return recResource ? this.formatResults([recResource])[0] : null;
  }

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
    limit?: number,
  ): Promise<any> {
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
      },
      select: this.recreationResourceSelect,
    };

    const countQuery = {
      where: filterQuery.where,
    };

    const recreationResources = await this.prisma.recreation_resource.findMany(
      filter
        ? filterQuery
        : { select: this.recreationResourceSelect, orderBy, skip, take },
    );

    const count = await this.prisma.recreation_resource.count(
      filter ? countQuery : undefined,
    );

    return {
      data: this.formatResults(recreationResources),
      page,
      limit,
      total: count,
    };
  }
}

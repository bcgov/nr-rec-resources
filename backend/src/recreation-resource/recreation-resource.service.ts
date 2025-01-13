import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

const { QueryMode } = Prisma;

@Injectable()
export class RecreationResourceService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<RecreationResourceDto[]> {
    const recResources = await this.prisma.recreation_resource.findMany();

    return recResources;
  }

  async findOne(id: string): Promise<RecreationResourceDto> {
    const recResource = await this.prisma.recreation_resource.findUnique({
      where: {
        forest_file_id: id,
      },
    });

    return recResource;
  }

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
    limit?: number,
  ): Promise<any> {
    // If only page is provided, we will return all records up to the end of that page
    // If limit is provided, we will return that many paginated records for lazy loading
    const take = limit ? limit : 10 * page;
    const skip = limit ? (page - 1) * limit : 0;

    const filterQuery = {
      skip,
      take,
      // If limit is provided, we will skip the records up to the end of the previous page
      where: {
        OR: [
          { name: { contains: filter, mode: QueryMode.insensitive } },
          { site_location: { contains: filter, mode: QueryMode.insensitive } },
        ],
      },
    };

    const countQuery = {
      where: filterQuery.where,
    };

    const recreationResources = await this.prisma.recreation_resource.findMany(
      filter ? filterQuery : { skip, take },
    );

    const count = await this.prisma.recreation_resource.count(
      filter ? countQuery : undefined,
    );

    return {
      data: recreationResources,
      page,
      limit,
      total: count,
    };
  }
}

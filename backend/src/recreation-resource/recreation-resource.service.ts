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

    return recResources.flatMap((recResource) => {
      const recResourceDto: RecreationResourceDto = {
        forest_file_id: recResource.forest_file_id,
        name: recResource.name,
        description: recResource.description,
        site_location: recResource.site_location,
      };

      return recResourceDto;
    });
  }

  async findOne(id: string): Promise<RecreationResourceDto> {
    const recResource = await this.prisma.recreation_resource.findUnique({
      where: {
        forest_file_id: id,
      },
    });

    return {
      forest_file_id: recResource.forest_file_id,
      name: recResource.name,
      description: recResource.description,
      site_location: recResource.site_location,
    };
  }

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
  ): Promise<any> {
    const limit = 10;
    page = page ?? 1;
    const take = parseInt(String(limit)) * page;

    const filterQuery = {
      take,
      where: { name: { contains: filter, mode: QueryMode.insensitive } },
    };

    const countQuery = {
      where: filterQuery.where,
    };

    const recreationResources = await this.prisma.recreation_resource.findMany(
      filter ? filterQuery : { take },
    );

    const count = await this.prisma.recreation_resource.count(
      filter ? countQuery : undefined,
    );

    return {
      data: recreationResources,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }
}

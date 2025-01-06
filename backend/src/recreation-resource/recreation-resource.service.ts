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
    page?: number,
    filter?: string,
  ): Promise<any> {
    const limit = 10;
    page = page ?? 1;
    const take = parseInt(String(limit)) * page;

    const filterQuery = {
      take,
      where: {
        OR: [
          {
            forest_file_id: {
              contains: filter,
              mode: QueryMode.insensitive,
            },
          },
          { name: { contains: filter, mode: QueryMode.insensitive } },
          {
            description: { contains: filter, mode: QueryMode.insensitive },
          },
          {
            site_location: {
              contains: filter,
              mode: QueryMode.insensitive,
            },
          },
        ],
      },
    };

    return this.prisma.$transaction(async () => {
      const recreationResources =
        await this.prisma.recreation_resource.findMany(filterQuery);

      const count = await this.prisma.recreation_resource.count({
        where: filterQuery?.where,
      });

      return {
        data: recreationResources,
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      };
    });
  }
}

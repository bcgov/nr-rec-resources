import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceDto } from "./dto/recreation-resource.dto";

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
    limit?: number,
    filter?: string,
  ): Promise<any> {
    page = page || 1;
    if (!limit || limit > 200) {
      limit = 10;
    }

    const recreationResources = await this.prisma.recreation_resource.findMany({
      skip: (page - 1) * limit,
      take: parseInt(String(limit)),
      where: filter ? { name: { contains: filter, mode: "insensitive" } } : {},
    });

    const count = recreationResources.length;

    return {
      data: recreationResources,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  public convertFiltersToPrismaFormat(filterObj): any {
    const prismaFilterObj = {};

    for (const item of filterObj) {
      if (item.operation === "like") {
        prismaFilterObj[item.key] = { contains: item.value };
      } else if (item.operation === "eq") {
        prismaFilterObj[item.key] = { equals: item.value };
      } else if (item.operation === "neq") {
        prismaFilterObj[item.key] = { not: { equals: item.value } };
      } else if (item.operation === "gt") {
        prismaFilterObj[item.key] = { gt: item.value };
      } else if (item.operation === "gte") {
        prismaFilterObj[item.key] = { gte: item.value };
      } else if (item.operation === "lt") {
        prismaFilterObj[item.key] = { lt: item.value };
      } else if (item.operation === "lte") {
        prismaFilterObj[item.key] = { lte: item.value };
      } else if (item.operation === "in") {
        prismaFilterObj[item.key] = { in: item.value };
      } else if (item.operation === "notin") {
        prismaFilterObj[item.key] = { not: { in: item.value } };
      } else if (item.operation === "isnull") {
        prismaFilterObj[item.key] = { equals: null };
      }
    }
    console.log(prismaFilterObj);
    return prismaFilterObj;
  }
}

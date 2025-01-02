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
}

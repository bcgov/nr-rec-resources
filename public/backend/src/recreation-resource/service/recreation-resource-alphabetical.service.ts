import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AlphabeticalRecreationResourceDto } from 'src/recreation-resource/dto/alphabetical-recreation-resource.dto';

@Injectable()
export class RecreationResourceAlphabeticalService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlphabeticalResources(
    letter: string,
    type?: string,
  ): Promise<AlphabeticalRecreationResourceDto[]> {
    const whereClause: any = { display_on_public_site: true };

    if (letter === '#') {
      // Filter for names that start with any digit (0-9)
      whereClause.OR = Array.from({ length: 10 }, (_, i) => ({
        name: {
          startsWith: i.toString(),
          mode: 'insensitive' as const,
        },
      }));
    } else {
      whereClause.name = {
        startsWith: letter.toUpperCase(),
        mode: 'insensitive' as const,
      };
    }

    // Add type filter if provided
    if (type) {
      whereClause.recreation_resource_type_view = {
        some: {
          rec_resource_type_code: type,
        },
      };
    }

    // Get resources ordered alphabetically
    const resources = await this.prisma.recreation_resource.findMany({
      where: whereClause,
      select: {
        rec_resource_id: true,
        name: true,
        closest_community: true,
        recreation_resource_type_view: {
          select: {
            rec_resource_type_code: true,
            description: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform the results to match our DTO
    return resources.map((resource) => ({
      rec_resource_id: resource.rec_resource_id,
      name: resource.name,
      closest_community: resource.closest_community,
      recreation_resource_type:
        resource.recreation_resource_type_view[0].description,
      recreation_resource_type_code:
        resource.recreation_resource_type_view[0].rec_resource_type_code,
    }));
  }
}

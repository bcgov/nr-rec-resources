import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AlphabeticalRecreationResourceDto } from 'src/recreation-resource/dto/alphabetical-recreation-resource.dto';

@Injectable()
export class RecreationResourceAlphabeticalService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlphabeticalResources(
    letter: string,
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

    // Get resources ordered alphabetically
    const resources = await this.prisma.recreation_resource.findMany({
      where: whereClause,
      select: { rec_resource_id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return resources;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { RecreationSuggestionDto } from 'src/recreation-resource/dto/recreation-resource-suggestion.dto';

const RESULTS_LIMIT = 5;

@Injectable()
export class RecreationResourceSuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(query: string): Promise<RecreationSuggestionDto[]> {
    const term = query.trim();
    try {
      const sql = Prisma.sql`
        SELECT
          rec_resource_id,
          name,
          closest_community,
          district_description,
          recreation_resource_type,
          recreation_resource_type_code,
          'recreation_resource' AS option_type
        FROM recreation_resource_search_view
        WHERE name ILIKE ${`%${term}%`} OR closest_community ILIKE ${`%${term}%`}
        ORDER BY
          CASE
            WHEN name ILIKE ${`${term}%`} THEN 0  -- prefix match in name
            WHEN name ILIKE ${`%${term}%`} THEN 1 -- partial match in name
            WHEN closest_community ILIKE ${`%${term}%`} THEN 2 -- prefix match in community
            ELSE 3
          END,
          name ASC
        LIMIT ${RESULTS_LIMIT}
        `;

      const results =
        await this.prisma.$queryRaw<RecreationSuggestionDto[]>(sql);

      return results ?? [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}

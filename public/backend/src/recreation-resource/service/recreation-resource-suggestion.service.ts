import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { RecreationSuggestionDto } from 'src/recreation-resource/dto/recreation-resource-suggestion.dto';
import {
  buildFuzzySearchConditions,
  buildFuzzySearchScore,
  buildSuggestionsOrdering,
} from 'src/recreation-resource/utils/fuzzySearchUtils';

const RESULTS_LIMIT = 5;

@Injectable()
export class RecreationResourceSuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(query: string): Promise<RecreationSuggestionDto[]> {
    const term = query.trim();
    try {
      const fuzzyConditions = buildFuzzySearchConditions(term);
      const fuzzyScore = buildFuzzySearchScore(term);
      const ordering = buildSuggestionsOrdering(term);

      const sql = Prisma.sql`
        SELECT
          rec_resource_id,
          name,
          closest_community,
          district_description,
          recreation_resource_type,
          recreation_resource_type_code,
          'recreation_resource' AS option_type
          ${fuzzyScore}
        FROM recreation_resource_search_view
        WHERE
          display_on_public_site = true
          AND ${fuzzyConditions}
        ${ordering}
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

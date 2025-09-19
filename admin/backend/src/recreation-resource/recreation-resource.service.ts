import { Injectable } from "@nestjs/common";
import { RecreationResourceRepository } from "./recreation-resource.repository";
import {
  SuggestionDto,
  SuggestionsResponseDto,
} from "./dtos/suggestions-response.dto";
import { getRecreationResourceSuggestions } from "@/prisma-generated-sql";
import { RecreationResourceDetailDto } from "./dtos/recreation-resource-detail.dto";
import { formatRecreationResourceDetailResults } from "./utils";

@Injectable()
export class RecreationResourceService {
  constructor(
    private readonly recreationResourceRepository: RecreationResourceRepository,
  ) {}

  /**
   * Retrieves recreation resource suggestions based on a search term.
   * @param searchTerm - Alphanumeric search term (min 3 characters)
   * @returns SuggestionsResponseDto with total and data array
   */
  async getSuggestions(searchTerm: string): Promise<SuggestionsResponseDto> {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const { total, data } =
      await this.recreationResourceRepository.findSuggestions(
        normalizedSearchTerm,
      );

    return {
      total,
      suggestions: data
        .filter(this.isValidSuggestion)
        .map((item: SuggestionDto) => ({
          name: item.name,
          rec_resource_id: item.rec_resource_id,
          recreation_resource_type: item.recreation_resource_type,
          recreation_resource_type_code: item.recreation_resource_type_code,
          district_description: item.district_description,
          display_on_public_site: item.display_on_public_site,
        })),
    };
  }

  /**
   * Finds a recreation resource by its ID.
   * @param rec_resource_id - The resource ID
   * @returns The resource detail DTO or null if not found
   */
  async findOne(
    rec_resource_id: string,
  ): Promise<RecreationResourceDetailDto | null> {
    const resource =
      await this.recreationResourceRepository.findOneById(rec_resource_id);
    if (!resource) return null;

    return formatRecreationResourceDetailResults(resource);
  }

  /**
   * Checks if a suggestion has required fields.
   */
  private isValidSuggestion(
    item: getRecreationResourceSuggestions.Result,
  ): item is SuggestionDto {
    return (
      Boolean(item.rec_resource_id) &&
      Boolean(item.name) &&
      Boolean(item.district_description)
    );
  }
}

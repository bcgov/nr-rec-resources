import { Injectable } from "@nestjs/common";
import { RecreationResourceRepository } from "./recreation-resource.repository";
import { SuggestionsResponseDto } from "./dtos/suggestions-response.dto";
import { getRecreationResourceSuggestions } from "@/prisma-generated-sql";

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
      suggestions: data.map(
        (item: getRecreationResourceSuggestions.Result) => ({
          name: item.name,
          rec_resource_id: item.rec_resource_id,
          recreation_resource_type: item.recreation_resource_type,
          recreation_resource_type_code: item.recreation_resource_type_code,
          district_description: item.district_description,
        }),
      ),
    };
  }
}

import {
  getRecreationResourceSpatialFeatureGeometry,
  getRecreationResourceSuggestions,
} from '@/prisma-generated-sql';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { RecreationResourceDetailDto } from './dtos/recreation-resource-detail.dto';
import {
  SuggestionDto,
  SuggestionsResponseDto,
} from './dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from './dtos/update-recreation-resource.dto';
import { RecreationResourceRepository } from './recreation-resource.repository';
import { formatRecreationResourceDetailResults } from './utils';

@Injectable()
export class RecreationResourceService {
  constructor(
    private readonly recreationResourceRepository: RecreationResourceRepository,
    private readonly prisma: PrismaService,
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
      suggestions: data.filter(this.isValidSuggestion).map(
        (item): SuggestionDto => ({
          name: item.name,
          rec_resource_id: item.rec_resource_id,
          recreation_resource_type: item.recreation_resource_type,
          recreation_resource_type_code: item.recreation_resource_type_code,
          district_description: item.district_description,
          display_on_public_site: item.display_on_public_site,
        }),
      ),
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

    // Fetch the spatial features
    const recResourceSpatialGeometryResult: getRecreationResourceSpatialFeatureGeometry.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceSpatialFeatureGeometry(rec_resource_id),
      );

    return formatRecreationResourceDetailResults(
      resource,
      recResourceSpatialGeometryResult,
    );
  }

  /**
   * Updates a recreation resource by its ID.
   * Intelligently handles both direct fields and related table updates.
   * Uses partial update semantics - only provided fields are updated.
   *
   * Note: Prisma errors are automatically handled by the global AllExceptionsFilter
   * and converted to appropriate HTTP exceptions (404, 400, 500).
   *
   * @param rec_resource_id - The resource ID
   * @param updateData - The data to update (validated by class-validator decorators)
   * @returns The updated resource detail DTO
   */
  async update(
    rec_resource_id: string,
    updateData: UpdateRecreationResourceDto,
  ): Promise<RecreationResourceDetailDto> {
    // Perform the update - Prisma errors will be caught by global exception filter
    const updatedResource = await this.recreationResourceRepository.update(
      rec_resource_id,
      updateData,
    );

    // Fetch spatial features for the updated resource
    const recResourceSpatialGeometryResult: getRecreationResourceSpatialFeatureGeometry.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceSpatialFeatureGeometry(rec_resource_id),
      );

    return formatRecreationResourceDetailResults(
      updatedResource,
      recResourceSpatialGeometryResult,
    );
  }

  /**
   * Checks if a suggestion has required fields.
   */
  private isValidSuggestion(
    item: getRecreationResourceSuggestions.Result,
  ): item is getRecreationResourceSuggestions.Result & {
    rec_resource_id: string;
    name: string;
  } {
    return Boolean(item.rec_resource_id) && Boolean(item.name);
  }
}

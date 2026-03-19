import { getRecreationResourceSpatialFeatureGeometry } from '@prisma-generated-sql/getRecreationResourceSpatialFeatureGeometry';
import { getRecreationResourceSuggestions } from '@prisma-generated-sql/getRecreationResourceSuggestions';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { RecreationResourceDetailDto } from './dtos/recreation-resource-detail.dto';
import {
  ADMIN_SEARCH_PAGE_SIZE_VALUES,
  AdminSearchQueryDto,
} from './dtos/admin-search-query.dto';
import {
  AdminSearchResponseDto,
  AdminSearchResultRowDto,
} from './dtos/admin-search-response.dto';
import {
  SuggestionDto,
  SuggestionsResponseDto,
} from './dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from './dtos/update-recreation-resource.dto';
import { OPEN_STATUS } from './recreation-resource.constants';
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

  async searchResources(
    query: AdminSearchQueryDto,
  ): Promise<AdminSearchResponseDto> {
    const defaultPageSize = ADMIN_SEARCH_PAGE_SIZE_VALUES[0];
    const normalizedQuery = {
      ...query,
      page: query.page ?? 1,
      page_size: query.page_size ?? defaultPageSize,
      sort: query.sort ?? 'name:asc',
    };
    const { total, data } =
      await this.recreationResourceRepository.searchResources(normalizedQuery);

    const mappedRows = data.map(
      (resource): AdminSearchResultRowDto => ({
        rec_resource_id: resource.rec_resource_id,
        name: resource.name ?? '',
        recreation_resource_type:
          resource.recreation_resource_type_view_admin?.[0]?.description ?? '',
        recreation_resource_type_code:
          resource.recreation_resource_type_view_admin?.[0]
            ?.rec_resource_type_code ?? '',
        district_description:
          resource.recreation_district_code?.description ?? '',
        display_on_public_site: resource.display_on_public_site ?? false,
        closest_community: resource.closest_community ?? '',
        // If no status exists a rec resource is considered open
        status:
          resource.recreation_status?.recreation_status_code?.description ??
          OPEN_STATUS.DESCRIPTION,
        status_code:
          resource.recreation_status?.status_code ?? OPEN_STATUS.STATUS_CODE,
        activities: this.getUniqueValues(
          resource.recreation_activity?.map(
            (activity) => activity.recreation_activity?.description ?? '',
          ) ?? [],
        ),
        access_types: this.getUniqueValues(
          resource.recreation_access?.map(
            (access) => access.recreation_access_code?.description ?? '',
          ) ?? [],
        ),
        fee_types: this.getFeeTypes(resource),
        established_date: resource.project_established_date
          ? resource.project_established_date.toISOString().slice(0, 10)
          : null,
        campsite_count: resource._count?.recreation_defined_campsite ?? 0,
      }),
    );

    return {
      data: mappedRows,
      total,
      page: normalizedQuery.page,
      page_size: normalizedQuery.page_size,
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

  private getUniqueValues(values: string[]): string[] {
    return Array.from(
      new Set(values.map((value) => value.trim()).filter(Boolean)),
    ).sort((left, right) =>
      left.localeCompare(right, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }

  private getFeeTypes(resource: {
    recreation_resource_reservation_info?: { rec_resource_id: string } | null;
    recreation_fee?: Array<{ recreation_fee_code: string }>;
  }): string[] {
    const feeTypes: string[] = [];

    if (resource.recreation_resource_reservation_info) {
      feeTypes.push('Reservable');
    }

    if ((resource.recreation_fee?.length ?? 0) > 0) {
      feeTypes.push('Has fees');
    } else {
      feeTypes.push('No fees');
    }

    return feeTypes;
  }
}

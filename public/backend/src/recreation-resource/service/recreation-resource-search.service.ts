import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { buildFilterMenu } from 'src/recreation-resource/utils/buildFilterMenu';
import { buildSearchFilterQuery } from 'src/recreation-resource/utils/buildSearchFilterQuery';
import { formatSearchResults } from 'src/recreation-resource/utils/formatSearchResults';
import { PaginatedRecreationResourceDto } from 'src/recreation-resource/dto/paginated-recreation-resource.dto';
import {
  AggregatedRecordCount,
  FilterTypes,
} from 'src/recreation-resource/service/types';
import { buildFilterOptionCountsQuery } from '../utils/buildSearchFilterOptionCountsQuery';
import { buildRecreationResourcePageQuery } from '../utils/buildRecreationResourcePageQuery';

@Injectable()
export class RecreationResourceSearchService {
  private static readonly MAX_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_NUMBER = 10;

  constructor(private readonly prisma: PrismaService) {}

  async searchRecreationResources(
    page: number = 1,
    searchText: string = '',
    limit?: number,
    activities?: string,
    type?: string,
    district?: string,
    access?: string,
    facilities?: string,
    lat?: number,
    lon?: number,
  ): Promise<PaginatedRecreationResourceDto> {
    // Validate pagination parameters
    this.validatePaginationParams(page, limit);

    // Normalize pagination values
    const take = this.normalizeTake(limit);
    const skip = this.calculateSkip(page, take);

    // Detect filter types
    const filterTypes = this.getFilterTypes({
      activities,
      type,
      district,
      access,
      facilities,
    });

    if ((lat && !lon) || (lon && !lat)) {
      throw new Error('Both lat and lon must be provided');
    }

    // Build the where clause for filtering
    const whereClause = buildSearchFilterQuery({
      searchText,
      activities,
      type,
      district,
      access,
      facilities,
      lat,
      lon,
    });

    const recreationResourcePageQuerySql = buildRecreationResourcePageQuery({
      whereClause,
      take,
      skip,
      lat,
      lon,
    });

    const filterOptionCountsQuerySql = buildFilterOptionCountsQuery({
      whereClause,
      searchText,
      filterTypes,
      lat,
      lon,
    });

    const [recreationResources, filterResults] = await Promise.all([
      this.prisma.$queryRaw<any[]>(recreationResourcePageQuerySql),
      this.prisma.$queryRaw<any[]>(filterOptionCountsQuerySql),
    ]);

    const unpaginatedIds =
      filterResults.find((row) => row.type === 'ids')?.rec_resource_ids ?? [];

    const extentGeoJson = filterResults.find(
      (row) => row.type === 'extent',
    )?.extent;

    const aggregatedCounts: AggregatedRecordCount[] = filterResults.filter(
      (row) => row.type !== 'ids' && row.type !== 'extent',
    );

    return this.formatResults(
      recreationResources,
      aggregatedCounts,
      page,
      take,
      unpaginatedIds,
      extentGeoJson,
    );
  }

  private validatePaginationParams(page: number, limit?: number): void {
    if (page > RecreationResourceSearchService.MAX_PAGE_NUMBER && !limit) {
      throw new Error(
        `Maximum page limit is ${RecreationResourceSearchService.MAX_PAGE_NUMBER} when no limit is provided`,
      );
    }
  }

  private normalizeTake(limit?: number): number {
    if (!limit || limit > RecreationResourceSearchService.MAX_PAGE_SIZE) {
      return RecreationResourceSearchService.MAX_PAGE_SIZE;
    }
    return limit;
  }

  private calculateSkip(page: number, take: number): number {
    return (page - 1) * take;
  }

  private formatResults(
    recreationResources: any[],
    aggregatedRecordCounts: AggregatedRecordCount[],
    page: number,
    limit?: number,
    unpaginatedIds: string[] = [],
    extent?: string | null,
  ): PaginatedRecreationResourceDto {
    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: recreationResources?.[0]?.total_count ?? 0,
      filters: buildFilterMenu(aggregatedRecordCounts),
      recResourceIds: unpaginatedIds,
      extent,
    };
  }

  private getFilterTypes(params: {
    activities?: string;
    type?: string;
    district?: string;
    access?: string;
    facilities?: string;
  }): FilterTypes {
    const { activities, type, district, access, facilities } = params;
    const hasNoOtherFilters = !activities && !facilities;

    return {
      isOnlyAccessFilter:
        Boolean(access) && !type && !district && hasNoOtherFilters,
      isOnlyDistrictFilter:
        Boolean(district) && !type && !access && hasNoOtherFilters,
      isOnlyTypeFilter:
        Boolean(type) && !district && !access && hasNoOtherFilters,
    };
  }
}

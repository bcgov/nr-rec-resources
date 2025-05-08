import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import { PaginatedRecreationResourceDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import {
  AggregatedRecordCount,
  FilterTypes,
} from "src/recreation-resource/service/types";
import { buildFilterOptionCountsQuery } from "../utils/buildSearchFilterOptionCountsQuery";
import { buildRecreationResourcePageQuery } from "../utils/buildRecreationResourcePageQuery";

@Injectable()
export class RecreationResourceSearchService {
  private static readonly MAX_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_NUMBER = 10;

  constructor(private readonly prisma: PrismaService) {}

  async searchRecreationResources(
    page: number = 1,
    filter: string = "",
    limit?: number,
    activities?: string,
    type?: string,
    district?: string,
    access?: string,
    facilities?: string,
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

    // Build the where clause for filtering
    const whereClause = buildSearchFilterQuery({
      filter,
      activities,
      type,
      district,
      access,
      facilities,
    });

    // Execute all queries in a transaction for consistency
    const [recreationResources, aggregatedCounts] = await this.executeQueries(
      whereClause,
      take,
      skip,
      filterTypes,
    );

    // Format and return the results
    return this.formatResults(
      recreationResources,
      aggregatedCounts,
      page,
      take,
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

  private async executeQueries(
    whereClause: Prisma.Sql,
    take: number,
    skip: number,
    filterTypes: FilterTypes,
  ) {
    const recreationResourcePageQuerySql = buildRecreationResourcePageQuery(
      whereClause,
      take,
      skip,
    );

    const filterOptionCountsQuerySql = buildFilterOptionCountsQuery(
      whereClause,
      filterTypes,
    );

    const [recreationResources, aggregatedCounts] = await Promise.all([
      this.prisma.$queryRaw<any[]>(recreationResourcePageQuerySql),
      this.prisma.$queryRaw<AggregatedRecordCount[]>(
        filterOptionCountsQuerySql,
      ),
    ]);

    return [recreationResources, aggregatedCounts];
  }

  private formatResults(
    recreationResources: any[],
    aggregatedRecordCounts: AggregatedRecordCount[],
    page: number,
    limit?: number,
  ): PaginatedRecreationResourceDto {
    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: recreationResources?.[0]?.total_count ?? 0,
      filters: buildFilterMenu(aggregatedRecordCounts),
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
      isOnlyAccessFilter: !!access && !type && !district && hasNoOtherFilters,
      isOnlyDistrictFilter: !!district && !type && !access && hasNoOtherFilters,
      isOnlyTypeFilter: !!type && !district && !access && hasNoOtherFilters,
    };
  }
}

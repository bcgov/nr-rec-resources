import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import { PaginatedRecreationResourceDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import { EXCLUDED_ACTIVITY_CODES } from "src/recreation-resource/constants/service.constants";
import {
  AggregatedRecordCount,
  FilterTypes,
} from "src/recreation-resource/service/types";

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
      limit,
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
    filterTypes?: {
      isOnlyAccessFilter: boolean;
      isOnlyDistrictFilter: boolean;
      isOnlyTypeFilter: boolean;
    },
  ) {
    return this.prisma.$transaction([
      this.getResourcesQuery(whereClause, take, skip),
      this.getAggregationsQuery(whereClause, filterTypes),
    ]);
  }

  private getResourcesQuery(
    whereClause: Prisma.Sql,
    take: number,
    skip: number,
  ) {
    return this.prisma.$queryRaw<any[]>`
      SELECT *, COUNT(*) OVER()::INT AS total_count
      FROM recreation_resource_search_view
        ${whereClause}
      ORDER BY name ASC
        LIMIT ${take} ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.empty}`;
  }

  private getAggregationsQuery(
    whereClause: Prisma.Sql,
    filterTypes?: {
      isOnlyAccessFilter: boolean;
      isOnlyDistrictFilter: boolean;
      isOnlyTypeFilter: boolean;
    },
  ) {
    return this.prisma.$queryRaw<AggregatedRecordCount[]>`
    WITH filtered_resources AS (
      SELECT *
      FROM recreation_resource_search_view
      ${whereClause}
    ),
    structure_counts AS (
      SELECT
        COUNT(*) AS total_count,
        COUNT(CASE WHEN has_toilets THEN 1 END)::INT AS total_toilet_count,
        COUNT(CASE WHEN has_tables THEN 1 END)::INT AS total_table_count
      FROM filtered_resources
    ),
    activity_counts AS (
      SELECT
        rac.recreation_activity_code,
        rac.description,
        COUNT(DISTINCT fr.rec_resource_id)::INT AS recreation_activity_count
      FROM rst.recreation_activity_code rac
      LEFT JOIN rst.recreation_activity ra ON rac.recreation_activity_code = ra.recreation_activity_code
      LEFT JOIN filtered_resources fr ON fr.rec_resource_id = ra.rec_resource_id
      WHERE rac.recreation_activity_code NOT IN (${Prisma.join(EXCLUDED_ACTIVITY_CODES)})
      GROUP BY rac.recreation_activity_code, rac.description
    ),
    district_counts AS (
      SELECT dcv.district_code    AS code,
             MAX(dcv.description) AS description,
             CASE
               WHEN ${filterTypes?.isOnlyDistrictFilter ?? false} THEN
                 (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code)::INT
            ELSE
                COUNT(fr.district_code)::INT
            END AS count
    FROM recreation_resource_district_count_view dcv
        LEFT JOIN filtered_resources fr
      ON fr.district_code = dcv.district_code
      WHERE dcv.district_code != 'NULL'
      GROUP BY dcv.district_code, dcv.description
    ),
    access_counts AS (
      SELECT acv.access_code AS code, acv.access_description AS description,
      CASE
        WHEN ${filterTypes?.isOnlyAccessFilter ?? false} THEN
            (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code)::INT
        ELSE
            COUNT(fr.access_code)::INT
        END AS count
      FROM recreation_resource_access_count_view acv
        LEFT JOIN filtered_resources fr
      ON fr.access_code = acv.access_code
      WHERE acv.access_code != 'NULL'
      GROUP BY acv.access_code, acv.access_description
    ),
    type_counts AS (
      SELECT acv.rec_resource_type_code AS code,
        MAX(acv.description) AS description,
      CASE
        WHEN ${filterTypes?.isOnlyTypeFilter ?? false} THEN
            (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code)::INT
        ELSE
            COUNT(fr.recreation_resource_type_code)::INT
        END AS count
      FROM recreation_resource_type_count_view acv
        LEFT JOIN filtered_resources fr
      ON fr.recreation_resource_type_code = acv.rec_resource_type_code
      GROUP BY acv.rec_resource_type_code, acv.description
    )

    SELECT 
      'activity' AS type,
      ac.recreation_activity_code::TEXT AS code,
      ac.description,
      ac.recreation_activity_count AS count,
      NULL::INT AS total_toilet_count,
      NULL::INT AS total_table_count,
      sc.total_count
    FROM activity_counts ac, structure_counts sc

    UNION ALL

    SELECT 
      'district', dc.code, dc.description, dc.count, NULL, NULL, sc.total_count
    FROM district_counts dc, structure_counts sc

    UNION ALL
    
    SELECT 
      'access', ac.code, ac.description, ac.count, NULL, NULL, sc.total_count
    FROM access_counts ac, structure_counts sc

    UNION ALL

    SELECT 
      'type', tc.code, tc.description, tc.count, NULL, NULL, sc.total_count
    FROM type_counts tc, structure_counts sc

    UNION ALL

    SELECT 
      'facilities', 'toilet', 'Toilets', sc.total_toilet_count, sc.total_toilet_count, sc.total_table_count, sc.total_count
    FROM structure_counts sc

    UNION ALL

    SELECT 
      'facilities', 'table', 'Tables', sc.total_table_count, sc.total_toilet_count, sc.total_table_count, sc.total_count
    FROM structure_counts sc

    ORDER BY type, description ASC;
  `;
  }

  private formatResults(
    recreationResources: any[],
    combinedRecordCounts: AggregatedRecordCount[],
    page: number,
    limit?: number,
  ): PaginatedRecreationResourceDto {
    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: recreationResources?.[0]?.total_count ?? 0,
      filters: buildFilterMenu({
        combinedRecordCounts,
      }),
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

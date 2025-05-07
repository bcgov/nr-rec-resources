import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import { PaginatedRecreationResourceDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import {
  EXCLUDED_ACTIVITY_CODES,
  EXCLUDED_RECREATION_DISTRICTS,
  EXCLUDED_RESOURCE_TYPES,
} from "src/recreation-resource/constants/service.constants";
import {
  CombinedRecordCount,
  CombinedStaticCount,
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
    const [
      recreationResources,
      combinedRecordCounts,
      dynamicCounts,
      combinedStaticCounts,
    ] = await this.executeQueries(whereClause, take, skip);

    // Format and return the results
    return this.formatResults(
      recreationResources,
      combinedRecordCounts,
      dynamicCounts,
      combinedStaticCounts,
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
  ) {
    return this.prisma.$transaction([
      this.getResourcesQuery(whereClause, take, skip),
      this.getRecordCountsQuery(whereClause),
      this.getStaticCountsQuery(whereClause),
      this.getStaticCountsQuery2(),
    ]);
  }

  private getResourcesQuery(
    whereClause: Prisma.Sql,
    take: number,
    skip: number,
  ) {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM recreation_resource_search_view
      ${whereClause}
      ORDER BY name ASC
      LIMIT ${take}
      ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.empty}`;
  }

  private getRecordCountsQuery(whereClause: Prisma.Sql) {
    return this.prisma.$queryRaw<CombinedRecordCount[]>`
      WITH filtered_resources AS (
        SELECT rec_resource_id, has_toilets, has_tables
        FROM recreation_resource_search_view
        ${whereClause}
      ),
      total_resources AS (
        SELECT COUNT(*) AS total_count FROM filtered_resources
      ),
      structure_counts AS (
        SELECT
          COUNT(CASE WHEN has_toilets = true THEN 1 END) AS total_toilet_count,
          COUNT(CASE WHEN has_tables = true THEN 1 END) AS total_table_count
        FROM filtered_resources
      )
      SELECT
        rac.recreation_activity_code,
        rac.description,
        COUNT(DISTINCT fra.rec_resource_id)::INT AS recreation_activity_count,
        sc.total_toilet_count::INT,
        sc.total_table_count::INT,
        tr.total_count::INT
      FROM rst.recreation_activity_code rac
      LEFT JOIN rst.recreation_activity ra ON ra.recreation_activity_code = rac.recreation_activity_code
      LEFT JOIN filtered_resources fra ON fra.rec_resource_id = ra.rec_resource_id,
      structure_counts sc,
      total_resources tr
      WHERE rac.recreation_activity_code NOT IN (${Prisma.join(EXCLUDED_ACTIVITY_CODES)})
      GROUP BY rac.recreation_activity_code, rac.description, sc.total_toilet_count, sc.total_table_count, tr.total_count
      ORDER BY rac.description ASC`;
  }

  private getStaticCountsQuery(whereClause: Prisma.Sql) {
    return this.prisma.$queryRaw<CombinedStaticCount[]>`
      WITH filtered_resources AS (SELECT rec_resource_id, recreation_resource_type_code, district_code, access_code
                                  FROM recreation_resource_search_view ${whereClause})

      SELECT 'district'       AS type,
             rd.district_code AS code,
             rd.description,
             COUNT(DISTINCT fr.rec_resource_id) ::INTEGER AS count
      FROM recreation_resource_district_count_view rd
        LEFT JOIN filtered_resources fr
      ON fr.district_code = rd.district_code
      WHERE rd.district_code NOT IN (${Prisma.join(EXCLUDED_RECREATION_DISTRICTS)})
      GROUP BY rd.district_code, rd.description
      HAVING COUNT (DISTINCT fr.rec_resource_id) > 0

      UNION ALL

      SELECT 'access'                  AS type,
             ra.access_code AS code,
             ra.access_description            AS description,
             COUNT(DISTINCT fr.rec_resource_id) ::INTEGER AS count
      FROM recreation_resource_access_count_view ra
        LEFT JOIN filtered_resources fr
      ON fr.access_code = ra.access_code
      WHERE ra.access_code NOT IN (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})
      GROUP BY ra.access_code, ra.access_description
      HAVING COUNT (DISTINCT fr.rec_resource_id) > 0

      UNION ALL

      SELECT 'type'                    AS type,
             rt.rec_resource_type_code AS code,
             rt.description,
             COUNT(DISTINCT fr.rec_resource_id) ::INTEGER AS count
      FROM recreation_resource_type_count_view rt
        LEFT JOIN filtered_resources fr
      ON fr.recreation_resource_type_code = rt.rec_resource_type_code
      WHERE rt.rec_resource_type_code NOT IN (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})
      GROUP BY rt.rec_resource_type_code, rt.description
      HAVING COUNT (DISTINCT fr.rec_resource_id) > 0

      ORDER BY description ASC`;
  }

  private getStaticCountsQuery2() {
    return this.prisma.$queryRaw<CombinedStaticCount[]>`
      SELECT 'district' AS type, district_code AS code, description, resource_count::INTEGER AS count
      FROM recreation_resource_district_count_view
      WHERE district_code NOT IN (${Prisma.join(EXCLUDED_RECREATION_DISTRICTS)})

      UNION ALL

      SELECT 'access' AS type, access_code AS code, access_description AS description, count::INTEGER AS count
      FROM recreation_resource_access_count_view
      WHERE access_code NOT IN (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})

      UNION ALL

      SELECT 'type' AS type, rec_resource_type_code AS code, description, count::INTEGER AS count
      FROM recreation_resource_type_count_view
      WHERE rec_resource_type_code NOT IN (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})

      ORDER BY description ASC`;
  }

  private formatResults(
    recreationResources: any[],
    combinedRecordCounts: CombinedRecordCount[],
    dynamicCounts: CombinedStaticCount[],
    combinedStaticCounts: CombinedStaticCount[],
    page: number,
    limit?: number,
  ): PaginatedRecreationResourceDto {
    const combinedArray = Array.from(
      new Map(
        [...combinedStaticCounts, ...dynamicCounts].map((item) => [
          item.code,
          item,
        ]),
      ).values(),
    );
    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: combinedRecordCounts?.[0]?.total_count ?? 0,
      filters: buildFilterMenu({
        combinedRecordCounts,
        combinedStaticCounts: combinedArray,
      }),
    };
  }
}

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
    lat?: number,
    lon?: number,
  ): Promise<PaginatedRecreationResourceDto> {
    // 10 page limit - max 100 records since if no limit we fetch page * limit
    if (page > 10 && !limit) {
      throw new Error("Maximum page limit is 10 when no limit is provided");
    }

    // 10 is the maximum limit
    if (limit && limit > 10) {
      limit = 10;
    }

    if ((lat && !lon) || (lon && !lat)) {
      throw new Error("Both lat and lon must be provided");
    }

    // If only page is provided, we will return all records up to the end of that page
    // If limit is provided, we will return that many paginated records for lazy loading
    const take = limit ? limit : 10;
    const skip = (page - 1) * take;

    const whereClause = buildSearchFilterQuery({
      filter,
      activities,
      type,
      district,
      access,
      facilities,
      lat,
      lon,
    });

    const [recreationResources, combinedRecordCounts, combinedStaticCounts] =
      await this.prisma.$transaction([
        this.prisma.$queryRaw<any[]>`
        select
          rec_resource_id,
          name,
          closest_community,
          display_on_public_site,
          recreation_resource_type,
          recreation_resource_type_code,
          recreation_activity,
          recreation_status,
          recreation_resource_images,
          district_code,
          district_description,
          access_code,
          access_description,
          recreation_structure,
          has_toilets,
          has_tables
        from recreation_resource_search_view
        ${whereClause}
        order by name asc
        limit ${take}
        ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.empty};`,

        // Query filter menu content and counts that change based on search results
        this.prisma.$queryRaw<CombinedRecordCount[]>`
        with filtered_resources as (
          select rec_resource_id, has_toilets, has_tables
          from recreation_resource_search_view
          ${whereClause}
        ),
        structure_counts as (
          select
            cast(count(case when has_toilets = true then rec_resource_id end) as int) as total_toilet_count,
            cast(count(case when has_tables = true then rec_resource_id end) as int) as total_table_count
          from filtered_resources
        )
        select
          rac.recreation_activity_code,
          rac.description,
          cast(count(distinct case when fra.rec_resource_id is not null then fra.rec_resource_id end) as int) as recreation_activity_count,
          (select total_toilet_count from structure_counts) as total_toilet_count,
          (select total_table_count from structure_counts) as total_table_count,
          cast((select count(*) from filtered_resources) as int) as total_count
        from rst.recreation_activity_code rac
          left join rst.recreation_activity ra on ra.recreation_activity_code = rac.recreation_activity_code
          left join filtered_resources fra on fra.rec_resource_id = ra.rec_resource_id
        where rac.recreation_activity_code not in (${Prisma.join(EXCLUDED_ACTIVITY_CODES)})
        group by rac.recreation_activity_code, rac.description
        order by rac.description asc;`,

        // Query filter menu content and counts that remain static
        this.prisma.$queryRaw<CombinedStaticCount[]>`
          (select 'district' as type, district_code as code, description, cast(resource_count as integer) as count
          from recreation_resource_district_count_view
          where district_code not in (${Prisma.join(EXCLUDED_RECREATION_DISTRICTS)}))
        union all
      (select 'access' as type, access_code as code, access_description as description, cast(count as integer) as count
          from recreation_resource_access_count_view
          where access_code not in (${Prisma.join(EXCLUDED_RESOURCE_TYPES)}))
        union all
      (select 'type' as type, rec_resource_type_code as code, description, cast(count as integer) as count
          from recreation_resource_type_count_view
          where rec_resource_type_code not in (${Prisma.join(EXCLUDED_RESOURCE_TYPES)}))
        order by description asc; `,
      ]);

    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: combinedRecordCounts?.[0]?.total_count ?? 0,
      filters: buildFilterMenu({
        combinedRecordCounts,
        combinedStaticCounts,
      }),
    };
  }
}

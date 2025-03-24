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
    // imageSizeCodes?: RecreationResourceImageSize[],
  ): Promise<PaginatedRecreationResourceDto> {
    // 10 page limit - max 100 records since if no limit we fetch page * limit
    if (page > 10 && !limit) {
      throw new Error("Maximum page limit is 10 when no limit is provided");
    }

    // 10 is the maximum limit
    if (limit && limit > 10) {
      limit = 10;
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
    });

    const [recreationResources, totalRecordIds, combinedCounts] =
      await this.prisma.$transaction([
        this.prisma.$queryRaw<any[]>`
          select * from recreation_resource_search_view
          ${whereClause}
          order by name asc
          limit ${take}
          ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.sql``};
        `,
        // Get all unpaginated but filtered rec_resource_ids for the records so we can group/count records for the filter sidebar
        // This can be used to get the count of each many to many filter group
        this.prisma.$queryRaw<any[]>`
          select rec_resource_id from recreation_resource_search_view
          ${whereClause}
          order by name asc;
        `,
        this.prisma.$queryRaw<any[]>`
          select 'district' as type, district_code as code, description, cast(resource_count as integer) as count
          from recreation_resource_district_count_view
            where district_code not in (${Prisma.join(EXCLUDED_RECREATION_DISTRICTS)})
          union all
          select 'access' as type, access_code as code, access_description as description, cast(count as integer) as count
          from recreation_resource_access_count_view
            where access_code not in (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})
          union all
          select 'type' as type, rec_resource_type_code as code, description, cast(count as integer) as count
          from recreation_resource_type_count_view
              where rec_resource_type_code not in (${Prisma.join(EXCLUDED_RESOURCE_TYPES)})
          order by description desc; `,
      ]);

    const totalRecordIdsList = totalRecordIds.map(
      (record) => record.rec_resource_id,
    );

    const [activityCounts, structureCounts] = await Promise.all([
      this.prisma.recreation_activity_code.findMany({
        select: {
          recreation_activity_code: true,
          description: true,
          _count: {
            select: {
              recreation_activity: {
                where: {
                  rec_resource_id: {
                    in: totalRecordIdsList,
                  },
                },
              },
            },
          },
        },
        where: {
          recreation_activity_code: {
            notIn: EXCLUDED_ACTIVITY_CODES,
          },
        },
        orderBy: {
          description: Prisma.SortOrder.asc,
        },
      }),
      this.prisma.$queryRaw<any[]>`
        select rec_resource_id,
        count(distinct case
          when rsc.description ilike '%toilet%' then rec_resource_id
        end) as toilet_count,
        count(distinct case
          when rsc.description ilike '%table%' then rec_resource_id
        end) as table_count
        from recreation_structure rs
        left join recreation_structure_code rsc on rs.structure_code = rsc.structure_code
        ${
          totalRecordIdsList.length > 0
            ? Prisma.sql`where rec_resource_id in (${Prisma.join(totalRecordIdsList)})`
            : Prisma.sql`where true`
        }
        group by rec_resource_id; `,
    ]);

    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: totalRecordIds?.length,
      filters: buildFilterMenu({
        structureCounts,
        activityCounts,
        combinedCounts,
      }),
    };
  }
}

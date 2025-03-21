import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { formatSearchResults } from "src/recreation-resource/utils/formatSearchResults";
import { RecreationResourceImageSize } from "src/recreation-resource/dto/recreation-resource-image.dto";
import { PaginatedRecreationResourceDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import {
  EXCLUDED_ACTIVITY_CODES,
  EXCLUDED_RECREATION_DISTRICTS,
  EXCLUDED_RESOURCE_TYPES,
} from "src/recreation-resource/constants/service.constants";

export const getSearchRecreationResourceSelect = (
  imageSizeCodes?: RecreationResourceImageSize[],
) => ({
  rec_resource_id: true,
  name: true,
  closest_community: true,
  display_on_public_site: true,
  recreation_resource_type: {
    select: {
      recreation_resource_type_code: true,
    },
  },
  recreation_activity: {
    select: {
      recreation_activity: true,
    },
  },
  recreation_status: {
    select: {
      recreation_status_code: {
        select: {
          description: true,
        },
      },
      comment: true,
      status_code: true,
    },
  },
  recreation_resource_images: {
    select: {
      ref_id: true,
      caption: true,
      recreation_resource_image_variants: {
        select: {
          size_code: true,
          url: true,
          width: true,
          height: true,
          extension: true,
        },
        where: {
          size_code: {
            in: imageSizeCodes ?? [],
          },
        },
      },
    },
  },
});

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
    imageSizeCodes?: RecreationResourceImageSize[],
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
    const orderBy = [{ name: Prisma.SortOrder.asc }];

    const where = buildSearchFilterQuery({
      filter,
      activities,
      type,
      district,
      access,
      facilities,
    });

    const [recreationResources, totalRecordIds, combinedCounts] =
      await this.prisma.$transaction([
        // Fetch paginated records
        this.prisma.recreation_resource.findMany({
          where,
          select: getSearchRecreationResourceSelect(imageSizeCodes),
          take,
          skip,
          orderBy,
        }),
        // Get all unpaginated but filtered rec_resource_ids for the records so we can group/count records for the filter sidebar
        // This can be used to get the count of each many to many filter group
        this.prisma.recreation_resource.findMany({
          where,
          select: { rec_resource_id: true },
        }),
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
          order by description desc;`,
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
      where rec_resource_id in (${Prisma.join(totalRecordIdsList)})
      group by rec_resource_id;`,
    ]);

    const toiletCount = structureCounts.reduce(
      (acc, curr) => acc + (Number(curr.toilet_count) || 0),
      0,
    );
    const tableCount = structureCounts.reduce(
      (acc, curr) => acc + (Number(curr.table_count) || 0),
      0,
    );

    // Format the activity counts as before
    const activityFilters = activityCounts.map((activity) => ({
      id: activity.recreation_activity_code.toString(),
      description: activity.description,
      count: activity._count.recreation_activity ?? 0,
    }));

    // Process the combined counts
    const recreationDistrictFilters = combinedCounts
      .filter((count) => count.type === "district")
      .map((district) => ({
        id: district.code,
        description: district.description,
        count: Number(district.count ?? 0),
      }));

    const recreationAccessFilters = combinedCounts
      .filter((count) => count.type === "access")
      .map((access) => ({
        id: access.code,
        description: `${access.description} Access`,
        count: Number(access.count ?? 0),
      }));

    const recResourceTypeFilters = combinedCounts
      .filter((count) => count.type === "type")
      .map((resourceType) => ({
        id: resourceType.code,
        description: resourceType.description,
        count: Number(resourceType.count ?? 0),
      }));

    return {
      data: formatSearchResults(recreationResources),
      page,
      limit,
      total: totalRecordIds?.length,
      filters: buildFilterMenu({
        recreationDistrictFilters,
        recResourceTypeFilters,
        activityFilters,
        toiletCount,
        tableCount,
        recreationAccessFilters,
      }),
    };
  }
}

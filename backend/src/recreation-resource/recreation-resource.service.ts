import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import {
  BaseRecreationResourceDto,
  RecreationResourceDetailDto,
} from "./dto/recreation-resource.dto";
import {
  RecreationResourceImageDto,
  RecreationResourceImageSize,
} from "./dto/recreation-resource-image.dto";
import { PaginatedRecreationResourceDto } from "./dto/paginated-recreation-resource.dto";
import { getRecreationResourceSpatialFeatureGeometry } from "@prisma-generated-sql";
import { RecreationResourceDocCode } from "./dto/recreation-resource-doc.dto";

const excludedActivityCodes = [26];
const excludedRecreationDistricts = ["RDQC", "RDRM"];
const excludedResourceTypes = ["RR"];

const getRecreationResourceSelect = (
  imageSizeCodes?: RecreationResourceImageSize[],
) => ({
  rec_resource_id: true,
  description: true,
  name: true,
  closest_community: true,
  display_on_public_site: true,
  recreation_resource_type: {
    select: {
      recreation_resource_type_code: true,
    },
  },
  recreation_access: {
    select: {
      recreation_access_code: {
        select: {
          description: true,
        },
      },
    },
  },
  recreation_activity: {
    select: {
      recreation_activity: true,
    },
  },
  recreation_campsite: true,
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
  recreation_fee: {
    select: {
      fee_amount: true,
      fee_start_date: true,
      fee_end_date: true,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: true,
      sunday_ind: true,
      recreation_fee_code: true,
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
  recreation_structure: {
    select: {
      recreation_structure_code: {
        select: {
          description: true,
        },
      },
    },
  },
});

const getRecreationResourceDetailSelect = (
  imageSizeCodes?: RecreationResourceImageSize[],
) => ({
  ...getRecreationResourceSelect(imageSizeCodes),
  recreation_resource_docs: {
    select: {
      doc_code: true,
      url: true,
      title: true,
      ref_id: true,
      extension: true,
      recreation_resource_doc_code: {
        select: {
          description: true,
        },
      },
    },
  },
});

// Always filter resource by these conditions
const recResourceWhereConstants = {
  display_on_public_site: {
    equals: true,
  },
  recreation_resource_type: {
    rec_resource_type_code: {
      notIn: excludedResourceTypes,
    },
  },
  district_code: {
    notIn: excludedRecreationDistricts,
  },
};

type RecreationResourceGetPayload = Prisma.recreation_resourceGetPayload<{
  select: ReturnType<typeof getRecreationResourceSelect>;
}>;

type RecreationResourceDetailGetPayload = Prisma.recreation_resourceGetPayload<{
  select: ReturnType<typeof getRecreationResourceDetailSelect>;
}>;

@Injectable()
export class RecreationResourceService {
  constructor(private readonly prisma: PrismaService) {}

  // Format the results to match the DTO
  formatResults(
    recResources: RecreationResourceGetPayload[],
  ): BaseRecreationResourceDto[] {
    return recResources?.map((resource) => ({
      ...resource,
      rec_resource_type:
        resource?.recreation_resource_type.recreation_resource_type_code
          .description,
      recreation_access: resource.recreation_access?.map(
        (access) => access.recreation_access_code.description,
      ),
      recreation_activity: resource.recreation_activity?.map((activity) => ({
        description: activity.recreation_activity.description,
        recreation_activity_code:
          activity.recreation_activity.recreation_activity_code,
      })),
      recreation_status: {
        description:
          resource.recreation_status?.recreation_status_code.description,
        comment: resource.recreation_status?.comment,
        status_code: resource.recreation_status?.status_code,
      },
      recreation_resource_images:
        resource.recreation_resource_images as RecreationResourceImageDto[],
      recreation_fee: resource.recreation_fee
        ?.filter((fee) => fee.recreation_fee_code === "C")
        .map((fee) => ({
          fee_amount: fee.fee_amount,
          fee_start_date: fee.fee_start_date,
          fee_end_date: fee.fee_end_date,
          monday_ind: fee.monday_ind,
          tuesday_ind: fee.tuesday_ind,
          wednesday_ind: fee.wednesday_ind,
          thursday_ind: fee.thursday_ind,
          friday_ind: fee.friday_ind,
          saturday_ind: fee.saturday_ind,
          sunday_ind: fee.sunday_ind,
          recreation_fee_code: fee.recreation_fee_code,
        })),
      additional_fees: resource.recreation_fee
        ?.filter((fee) => fee.recreation_fee_code !== "C")
        .map((fee) => ({
          fee_amount: fee.fee_amount,
          fee_start_date: fee.fee_start_date,
          fee_end_date: fee.fee_end_date,
          monday_ind: fee.monday_ind,
          tuesday_ind: fee.tuesday_ind,
          wednesday_ind: fee.wednesday_ind,
          thursday_ind: fee.thursday_ind,
          friday_ind: fee.friday_ind,
          saturday_ind: fee.saturday_ind,
          sunday_ind: fee.sunday_ind,
          recreation_fee_code: fee.recreation_fee_code,
        })),
      recreation_structure: {
        has_toilet: resource.recreation_structure?.some((s) =>
          s.recreation_structure_code.description
            .toLowerCase()
            .includes("toilet"),
        )
          ? true
          : false,
        has_table: resource.recreation_structure?.some((s) =>
          s.recreation_structure_code.description
            .toLowerCase()
            .includes("table"),
        )
          ? true
          : false,
      },
    }));
  }

  formatRecreationResourceDetailResults(
    result: RecreationResourceDetailGetPayload,
    spatial_feature_geometry: getRecreationResourceSpatialFeatureGeometry.Result[] = [],
  ): RecreationResourceDetailDto {
    const formatted = this.formatResults([result])[0];

    return {
      ...formatted,
      recreation_resource_docs: result.recreation_resource_docs.map((i) => ({
        ...i,
        doc_code: i.doc_code as RecreationResourceDocCode,
        doc_code_description: i.recreation_resource_doc_code.description,
      })),
      spatial_feature_geometry: (spatial_feature_geometry || []).map(
        ({ spatial_feature_geometry }) => spatial_feature_geometry,
      ),
    };
  }

  async findOne(
    id: string,
    imageSizeCodes?: RecreationResourceImageSize[],
  ): Promise<RecreationResourceDetailDto> {
    const recResource = await this.prisma.recreation_resource.findUnique({
      where: {
        rec_resource_id: id,
        AND: {
          display_on_public_site: true,
        },
      },
      select: getRecreationResourceDetailSelect(imageSizeCodes),
    });

    if (!recResource) {
      return null;
    }

    // fetch the spatial features
    const recResourceSpatialGeometryResult: getRecreationResourceSpatialFeatureGeometry.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceSpatialFeatureGeometry(id),
      );

    return this.formatRecreationResourceDetailResults(
      recResource,
      recResourceSpatialGeometryResult,
    );
  }

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
    const activityFilter = activities?.split("_").map(Number);
    const typeFilter = type?.split("_").map(String);
    const districtFilter = district?.split("_").map(String);
    const accessFilter = access?.split("_").map(String);
    const facilityFilter = facilities?.split("_").map(String);

    const activityFilterQuery = activities && {
      AND: activityFilter.map((activity) => ({
        recreation_activity: {
          some: {
            recreation_activity_code: activity,
          },
        },
      })),
    };

    const accessFilterQuery = access && {
      recreation_access: {
        some: {
          access_code: {
            in: accessFilter,
          },
        },
      },
    };

    const resourceTypeFilterQuery = type && {
      in: typeFilter,
    };

    const districtFilterQuery = district && {
      district_code: {
        in: districtFilter,
      },
    };

    const facilityFilterQuery = facilities && {
      AND: facilityFilter.map((facility) => ({
        recreation_structure: {
          some: {
            recreation_structure_code: {
              description: {
                contains: facility,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
      })),
    };

    const where = {
      OR: [
        { name: { contains: filter, mode: Prisma.QueryMode.insensitive } },
        {
          closest_community: {
            contains: filter,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
      AND: [
        { display_on_public_site: true },
        {
          recreation_resource_type: {
            rec_resource_type_code: {
              notIn: excludedResourceTypes,
              ...resourceTypeFilterQuery,
            },
          },
        },
        {
          district_code: {
            notIn: excludedRecreationDistricts,
          },
        },
        accessFilterQuery,
        districtFilterQuery,
        activityFilterQuery,
        facilityFilterQuery,
      ].filter(Boolean),
    };
    const [
      recreationResources,
      totalRecordIds,
      recreationDistrictCounts,
      recreationAccessCounts,
      recResourceTypeCounts,
    ] = await this.prisma.$transaction([
      // Fetch paginated records
      this.prisma.recreation_resource.findMany({
        where,
        select: getRecreationResourceSelect(imageSizeCodes),
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

      // Get counts for all, unfiltered recreation_districts that are in the records
      this.prisma.recreation_district_code.findMany({
        select: {
          district_code: true,
          description: true,
          _count: {
            select: {
              recreation_resource: {
                where: recResourceWhereConstants,
              },
            },
          },
        },
        where: {
          district_code: {
            notIn: excludedRecreationDistricts,
          },
        },
        orderBy: {
          description: Prisma.SortOrder.asc,
        },
      }),
      this.prisma.recreation_access_code.findMany({
        select: {
          access_code: true,
          description: true,
          _count: {
            select: {
              recreation_access: {
                where: {
                  recreation_resource: {
                    ...recResourceWhereConstants,
                  },
                },
              },
            },
          },
        },
      }),
      // Get counts for all, unfiltered resource types that are in the records
      this.prisma.recreation_resource_type_code.findMany({
        select: {
          rec_resource_type_code: true,
          description: true,
          _count: {
            select: {
              recreation_resource_type: {
                where: {
                  recreation_resource: {
                    ...recResourceWhereConstants,
                  },
                  recreation_resource_type_code: {
                    rec_resource_type_code: {
                      notIn: excludedResourceTypes,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          rec_resource_type_code: {
            notIn: excludedResourceTypes,
          },
        },
        orderBy: {
          description: Prisma.SortOrder.desc,
        },
      }),
    ]);

    const totalRecordIdsList = totalRecordIds.map(
      (record) => record.rec_resource_id,
    );

    const [activityCounts, toiletCount, tableCount] = await Promise.all([
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
            notIn: excludedActivityCodes,
          },
        },
        orderBy: {
          description: Prisma.SortOrder.asc,
        },
      }),
      this.prisma.recreation_structure.findMany({
        where: {
          rec_resource_id: {
            in: totalRecordIdsList,
          },
          recreation_structure_code: {
            description: { contains: "toilet", mode: "insensitive" },
          },
        },
        distinct: ["rec_resource_id"],
      }),
      this.prisma.recreation_structure.findMany({
        where: {
          rec_resource_id: {
            in: totalRecordIdsList,
          },
          recreation_structure_code: {
            description: { contains: "table", mode: "insensitive" },
          },
        },
        select: {
          rec_resource_id: true,
        },
        distinct: ["rec_resource_id"],
      }),
    ]);

    const activityFilters = activityCounts.map((activity) => ({
      id: activity.recreation_activity_code.toString(),
      description: activity.description,
      count: activity._count.recreation_activity ?? 0,
    }));

    const recResourceTypeFilters = recResourceTypeCounts.map(
      (resourceType) => ({
        id: resourceType.rec_resource_type_code,
        description: resourceType.description,
        count: resourceType._count.recreation_resource_type ?? 0,
      }),
    );

    const recreationDistrictFilters = recreationDistrictCounts.map(
      (district) => ({
        id: district.district_code,
        description: district.description,
        count: district._count.recreation_resource ?? 0,
      }),
    );

    const recreationAccessFilters = recreationAccessCounts.map((access) => ({
      id: access.access_code,
      description: `${access.description} Access`,
      count: access._count.recreation_access ?? 0,
    }));

    return {
      data: this.formatResults(recreationResources),
      page,
      limit,
      total: totalRecordIds?.length,
      filters: [
        {
          type: "multi-select",
          label: "District",
          param: "district",
          options: recreationDistrictFilters,
        },
        {
          type: "multi-select",
          label: "Type",
          param: "type",
          options: recResourceTypeFilters,
        },
        {
          type: "multi-select",
          label: "Things to do",
          param: "activities",
          options: activityFilters,
        },
        {
          type: "multi-select",
          label: "Facilities",
          param: "facilities",
          options: [
            {
              id: "toilet",
              description: "Toilets",
              count: toiletCount.length,
            },
            {
              id: "table",
              description: "Tables",
              count: tableCount.length,
            },
          ],
        },
        {
          type: "multi-select",
          label: "Access Type",
          param: "access",
          options: recreationAccessFilters,
        },
      ],
    };
  }
}

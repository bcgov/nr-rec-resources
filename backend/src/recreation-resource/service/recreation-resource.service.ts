import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { formatRecreationResourceDetailResults } from "src/recreation-resource/utils/formatRecreationResourceDetailResults";
import { RecreationResourceDetailDto } from "src/recreation-resource/dto/recreation-resource.dto";
import { RecreationResourceImageSize } from "src/recreation-resource/dto/recreation-resource-image.dto";
import { getRecreationResourceSpatialFeatureGeometry } from "@prisma-generated-sql";
import { EXCLUDED_ACTIVITY_CODES } from "src/recreation-resource/constants/service.constants";

export const getRecreationResourceSelect = (
  imageSizeCodes?: RecreationResourceImageSize[],
) => ({
  rec_resource_id: true,
  description: true,
  name: true,
  closest_community: true,
  display_on_public_site: true,
  recreation_map_feature: {
    select: {
      recreation_resource_type_code: {
        select: {
          rec_resource_type_code: true,
          description: true,
        },
      },
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
    where: {
      recreation_activity_code: {
        notIn: EXCLUDED_ACTIVITY_CODES,
      },
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
      with_description: {
        select: {
          description: true,
        },
      },
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

@Injectable()
export class RecreationResourceService {
  constructor(private readonly prisma: PrismaService) {}

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
      select: getRecreationResourceSelect(imageSizeCodes),
    });

    if (!recResource) {
      return null;
    }

    // fetch the spatial features
    const recResourceSpatialGeometryResult: getRecreationResourceSpatialFeatureGeometry.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceSpatialFeatureGeometry(id),
      );

    return formatRecreationResourceDetailResults(
      recResource,
      recResourceSpatialGeometryResult,
    );
  }
}

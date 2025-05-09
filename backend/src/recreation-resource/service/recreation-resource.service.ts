import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RecreationResourceSearchService } from "src/recreation-resource/service/recreation-resource-search.service";
import { formatRecreationResourceDetailResults } from "src/recreation-resource/utils/formatRecreationResourceDetailResults";
import { getRecreationResourceSelect } from "src/recreation-resource/utils/getRecreationResourceSelect";
import { RecreationResourceDetailDto } from "src/recreation-resource/dto/recreation-resource.dto";
import { RecreationResourceImageSize } from "src/recreation-resource/dto/recreation-resource-image.dto";
import { getRecreationResourceSpatialFeatureGeometry } from "@prisma-generated-sql";

@Injectable()
export class RecreationResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recreationResourceSearchService: RecreationResourceSearchService,
  ) {}

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

  async findClientNumber(id: string): Promise<string> {
    const agreementHolder =
      await this.prisma.recreation_agreement_holder.findUnique({
        where: {
          rec_resource_id: id,
        },
        select: {
          client_number: true,
        },
      });

    if (!agreementHolder) {
      return null;
    }

    return agreementHolder.client_number;
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
    lat?: number,
    lon?: number,
  ) {
    return this.recreationResourceSearchService.searchRecreationResources(
      page,
      filter,
      limit,
      activities,
      type,
      district,
      access,
      facilities,
      lat,
      lon,
    );
  }
}

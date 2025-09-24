import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RecreationResourceSearchService } from 'src/recreation-resource/service/recreation-resource-search.service';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { RecreationResourceAlphabeticalService } from 'src/recreation-resource/service/recreation-resource-alphabetical.service';
import { RecreationSuggestionDto } from 'src/recreation-resource/dto/recreation-resource-suggestion.dto';
import { formatRecreationResourceDetailResults } from 'src/recreation-resource/utils/formatRecreationResourceDetailResults';
import { getRecreationResourceSelect } from 'src/recreation-resource/utils/getRecreationResourceSelect';
import { RecreationResourceDetailDto } from 'src/recreation-resource/dto/recreation-resource.dto';
import { RecreationResourceImageSize } from 'src/recreation-resource/dto/recreation-resource-image.dto';
import { AlphabeticalRecreationResourceDto } from 'src/recreation-resource/dto/alphabetical-recreation-resource.dto';
import { getRecreationResourceSpatialFeatureGeometry } from '@prisma-generated-sql';

@Injectable()
export class RecreationResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recreationResourceSearchService: RecreationResourceSearchService,
    private readonly recreationResourceSuggestionsService: RecreationResourceSuggestionsService,
    private readonly recreationResourceAlphabeticalService: RecreationResourceAlphabeticalService,
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
    filter: string = '',
    limit?: number,
    activities?: string,
    type?: string,
    district?: string,
    access?: string,
    facilities?: string,
    status?: string,
    fees?: string,
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
      status,
      fees,
      lat,
      lon,
    );
  }

  async getSuggestions(query: string): Promise<RecreationSuggestionDto[]> {
    return this.recreationResourceSuggestionsService.getSuggestions(query);
  }

  async getAlphabeticalResources(
    letter: string,
    type?: string,
  ): Promise<AlphabeticalRecreationResourceDto[]> {
    return this.recreationResourceAlphabeticalService.getAlphabeticalResources(
      letter,
      type,
    );
  }
}

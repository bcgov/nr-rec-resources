import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecreationResourceService } from 'src/recreation-resource/service/recreation-resource.service';
import { PaginatedRecreationResourceDto } from './dto/paginated-recreation-resource.dto';
import { RecreationResourceImageSize } from './dto/recreation-resource-image.dto';
import { ParseImageSizesPipe } from './pipes/parse-image-sizes.pipe';
import { RecreationSuggestionDto } from 'src/recreation-resource/dto/recreation-resource-suggestion.dto';
import {
  RecreationResourceDetailDto,
  RecreationResourceSearchWithGeometryDto,
  SiteOperatorDto,
} from './dto/recreation-resource.dto';
import { AlphabeticalRecreationResourceDto } from './dto/alphabetical-recreation-resource.dto';
import { FsaResourceService } from './service/fsa-resource.service';
import { RecreationResourceGeometry } from './dto/recreation-resource-geometry.dto';

@ApiTags('recreation-resource')
@Controller({ path: 'recreation-resource', version: '1' })
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
    private readonly fsaResourceService: FsaResourceService,
  ) {}

  @ApiOperation({
    summary: 'Search recreation resources',
    operationId: 'searchRecreationResources',
    description: `
      Returns a paginated list of recreation resources and related data (result counts, filters, extent).
      The unpaginated summary data (counts, filters, extent) is based on the first 5000 matching records only, due
      to internal limits for performance reasons. This limit does not affect the main paginated resource list.`,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description: 'Search filter',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'activities',
    required: false,
    type: String,
    description: 'Recreation activities',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Recreation resource type',
  })
  @ApiQuery({
    name: 'district',
    required: false,
    type: String,
    description: 'Recreation district',
  })
  @ApiQuery({
    name: 'access',
    required: false,
    type: String,
    description: 'Recreation resource access type',
  })
  @ApiQuery({
    name: 'facilities',
    required: false,
    type: String,
    description: 'Recreation resource facilities',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Recreation resource status (Open/Closed)',
  })
  @ApiQuery({
    name: 'fees',
    required: false,
    type: String,
    description:
      'Recreation resource fee type (R for Reservable, F for Fees, NF for No fees)',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitude for location-based search',
  })
  @ApiQuery({
    name: 'lon',
    required: false,
    type: Number,
    description: 'Longitude for location-based search',
  })
  @ApiResponse({
    status: 200,
    description: 'Resources found',
    type: PaginatedRecreationResourceDto,
  })
  @Get('search') // it must be ahead Get(":id") to avoid conflict
  async searchRecreationResources(
    @Query('filter') filter: string = '',
    @Query('limit') limit?: number,
    @Query('page') page: number = 1,
    @Query('activities') activities?: string,
    @Query('type') type?: string,
    @Query('district') district?: string,
    @Query('access') access?: string,
    @Query('facilities') facilities?: string,
    @Query('status') status?: string,
    @Query('fees') fees?: string,
    @Query('lat') lat?: number,
    @Query('lon') lon?: number,
  ): Promise<PaginatedRecreationResourceDto> {
    return await this.recreationResourceService.searchRecreationResources(
      page,
      filter ?? '',
      limit ? parseInt(String(limit)) : undefined,
      activities,
      type,
      district,
      access,
      facilities,
      status,
      fees,
      lat ? parseFloat(String(lat)) : undefined,
      lon ? parseFloat(String(lon)) : undefined,
    );
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
    operationId: 'getRecreationSuggestions',
    description:
      'Returns a list of suggested recreation resources based on a partial search term.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Partial name or keyword to suggest resources for',
  })
  @ApiResponse({
    status: 200,
    description: 'List of suggested resources',
    type: [RecreationSuggestionDto],
  })
  async getSuggestions(
    @Query('query') query: string,
  ): Promise<RecreationSuggestionDto[]> {
    if (!query || query.trim().length === 0) {
      throw new HttpException("Query parameter 'query' is required", 400);
    }

    return this.recreationResourceService.getSuggestions(query);
  }

  @Get('alphabetical')
  @ApiOperation({
    summary: 'Get recreation resources alphabetically',
    operationId: 'getRecreationResourcesAlphabetically',
    description:
      'Returns recreation resources in alphabetical order. Use letter parameter to filter by starting letter (A-Z) or # for numerical names.',
  })
  @ApiQuery({
    name: 'letter',
    required: true,
    type: String,
    description:
      'Filter resources by starting letter (A-Z) or # for numerical names.',
    example: 'A',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Filter by recreation resource type code',
  })
  @ApiResponse({
    status: 200,
    description: 'Resources in alphabetical order',
    type: [AlphabeticalRecreationResourceDto],
  })
  async getAlphabeticalResources(
    @Query('letter') letter: string,
    @Query('type') type?: string,
  ): Promise<AlphabeticalRecreationResourceDto[]> {
    return this.recreationResourceService.getAlphabeticalResources(
      letter,
      type,
    );
  }

  @Get('geometry')
  @ApiOperation({
    summary: 'Search recreation resources with geometry',
    operationId: 'searchRecreationResourcesWithGeometry',
    description: `
      Returns a non paginated list of recreation resources and related data with geometry appended.
      The unpaginated summary data (counts, filters, extent) is based on the first 5000 matching records only, due
      to internal limits for performance reasons. This limit does not affect the main paginated resource list.`,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description: 'Search filter',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'activities',
    required: false,
    type: String,
    description: 'Recreation activities',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Recreation resource type',
  })
  @ApiQuery({
    name: 'district',
    required: false,
    type: String,
    description: 'Recreation district',
  })
  @ApiQuery({
    name: 'access',
    required: false,
    type: String,
    description: 'Recreation resource access type',
  })
  @ApiQuery({
    name: 'facilities',
    required: false,
    type: String,
    description: 'Recreation resource facilities',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Recreation resource status (Open/Closed)',
  })
  @ApiQuery({
    name: 'fees',
    required: false,
    type: String,
    description:
      'Recreation resource fee type (R for Reservable, F for Fees, NF for No fees)',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitude for location-based search',
  })
  @ApiQuery({
    name: 'lon',
    required: false,
    type: Number,
    description: 'Longitude for location-based search',
  })
  @ApiResponse({
    status: 200,
    description: 'Resources found',
    type: [RecreationResourceSearchWithGeometryDto],
  })
  async getMultipleGeometry(
    @Query('filter') filter: string = '',
    @Query('limit') limit?: number,
    @Query('page') page: number = 1,
    @Query('activities') activities?: string,
    @Query('type') type?: string,
    @Query('district') district?: string,
    @Query('access') access?: string,
    @Query('facilities') facilities?: string,
    @Query('status') status?: string,
    @Query('fees') fees?: string,
    @Query('lat') lat?: number,
    @Query('lon') lon?: number,
  ): Promise<RecreationResourceSearchWithGeometryDto[]> {
    const result =
      await this.recreationResourceService.searchRecreationResources(
        page,
        filter ?? '',
        limit ? parseInt(String(limit)) : undefined,
        activities,
        type,
        district,
        access,
        facilities,
        status,
        fees,
        lat ? parseFloat(String(lat)) : undefined,
        lon ? parseFloat(String(lon)) : undefined,
      );

    const geometries = await this.recreationResourceService.getMultipleGeometry(
      result.recResourceIds,
    );
    return result.data.map((rec) => {
      const g = geometries.find(
        (g: RecreationResourceGeometry) =>
          g.rec_resource_id === rec.rec_resource_id,
      );
      return {
        ...rec,
        description: g.description,
        spatial_feature_geometry: g.spatial_feature_geometry,
        site_point_geometry: g.site_point_geometry,
      };
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find recreation resource by ID',
    operationId: 'getRecreationResourceById',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiQuery({
    name: 'imageSizeCodes',
    required: false,
    enum: RecreationResourceImageSize,
    isArray: true,
    description:
      'Comma separated list of image sizes codes to be returned for the ' +
      'recreation resource. You can pass a single status or multiple size codes separated by commas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource found',
    type: RecreationResourceDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(
    @Param('id') id: string,
    @Query(
      'imageSizeCodes',
      new ParseImageSizesPipe([RecreationResourceImageSize.HIGH_RES_PRINT]),
    )
    imageSizeCodes?: RecreationResourceImageSize[],
  ): Promise<RecreationResourceDetailDto> {
    const recResource = await this.recreationResourceService.findOne(
      id,
      imageSizeCodes,
    );
    if (!recResource) {
      throw new HttpException('Recreation Resource not found.', 404);
    }
    return recResource;
  }

  @Get(':id/site-operator')
  @ApiOperation({
    summary: 'Find site operator by resource ID',
    operationId: 'getSiteOperatorById',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiResponse({
    status: 200,
    description: 'Site operator found',
    type: SiteOperatorDto,
  })
  @ApiResponse({ status: 404, description: 'Site operator not found' })
  async findSiteOperator(@Param('id') id: string): Promise<SiteOperatorDto> {
    const clientNumber =
      await this.recreationResourceService.findClientNumber(id);
    if (!clientNumber)
      throw new HttpException({ data: 'Site operator not found' }, 404);

    const r = await this.fsaResourceService.findByClientNumber(clientNumber);
    return {
      clientName: r.clientName,
      clientNumber: r.clientNumber,
      clientStatusCode: r.clientStatusCode,
      clientTypeCode: r.clientTypeCode,
      legalFirstName: r.legalFirstName,
      legalMiddleName: r.legalMiddleName,
      acronym: r.acronym,
    } as SiteOperatorDto;
  }
}

import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthRoles,
  AuthRolesGuard,
  AUTH_STRATEGY,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BcgwService } from './bcgw.service';
import { BcgwExportService } from './export/bcgw-export.service';
import { BcgwLayerManifestDto } from './dto/bcgw-layer-manifest.dto';
import {
  BcgwFeatureCollectionDto,
  BcgwRecreationResourceDto,
} from './dto/bcgw-recreation-resource.dto';
import {
  BcgwClosuresShortDto,
  BcgwClosuresShortFeatureCollectionDto,
} from './dto/bcgw-closures-short.dto';
import {
  BcgwRecreationLinesDto,
  BcgwRecreationLinesFeatureCollectionDto,
} from './dto/bcgw-recreation-lines.dto';
import {
  BcgwRecreationPolygonsDto,
  BcgwRecreationPolygonsFeatureCollectionDto,
} from './dto/bcgw-recreation-polygons.dto';
import { BCGW_LAYERS } from './export/bcgw-layers';

/**
 * Each layer is served two ways.
 *
 * The layer's own path redirects to a pre-generated gzipped GeoJSON file in S3,
 * because the full datasets are far too large to serialize into a response
 * (recreation-lines alone is ~143 MB uncompressed). A single GET with redirects
 * followed downloads the whole layer, which is how BCGW consumes these.
 *
 * The `/features` sub-path pages through the same layer live, for debugging and for
 * consumers that would rather page than download.
 */
const REDIRECT_DESCRIPTION =
  'Redirects (302) to a presigned URL for the most recent export of this layer, ' +
  'a gzipped GeoJSON FeatureCollection. Clients must follow redirects. ' +
  'Files are regenerated on a schedule from materialized views, so the data is ' +
  'as fresh as the last export run.';

const NOT_FOUND_DESCRIPTION = 'No export has been produced for this layer yet.';

/** Page size for a layer, so the Swagger docs cannot drift from the real value. */
const pageSizeOf = (layerName: string): number =>
  BCGW_LAYERS.find((layer) => layer.name === layerName)!.pageSize;

/**
 * The paginated endpoints read the views live, so they can disagree with a
 * download by up to one export interval.
 */
const PAGINATED_DESCRIPTION =
  'Returns one page of this layer as a GeoJSON FeatureCollection, read live from ' +
  'the materialized views. Page size varies by layer and is reported in `meta`. ' +
  'For the whole layer in one request, use the unsuffixed endpoint, which ' +
  'redirects to a pre-generated file.';

@ApiTags('bcgw')
@Controller({ path: 'bcgw', version: '1' })
export class BcgwController {
  constructor(
    private readonly bcgwService: BcgwService,
    private readonly bcgwExportService: BcgwExportService,
  ) {}

  @Get('closures-fully-attributed')
  @UseGuards(AuthGuard(AUTH_STRATEGY.BCGW_KEYCLOAK))
  @ApiBearerAuth(AUTH_STRATEGY.BCGW_KEYCLOAK)
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized — missing, malformed, or expired bearer token. ' +
      'Obtain a token from CSS using the OAuth2 Client Credentials flow.',
  })
  @ApiOperation({
    summary: 'Download all recreation resources for BCGW ingestion',
    operationId: 'getBcgwClosuresFullyAttributed',
    description:
      'Recreation resources for the ' +
      'WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_FA_SV layer. ' +
      REDIRECT_DESCRIPTION,
  })
  @ApiResponse({ status: 302, description: 'Redirect to the layer file' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESCRIPTION })
  @Redirect()
  async getRecreationResources() {
    return this.redirectTo('closures-fully-attributed');
  }

  @Get('closures-short')
  @ApiOperation({
    summary: 'Download recreation resources for the short closures BCGW layer',
    operationId: 'getBcgwClosuresShort',
    description:
      'A 20-column subset of the fully attributed closures layer, for the ' +
      'WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_SV layer. ' +
      REDIRECT_DESCRIPTION,
  })
  @ApiResponse({ status: 302, description: 'Redirect to the layer file' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESCRIPTION })
  @Redirect()
  async getClosuresShort() {
    return this.redirectTo('closures-short');
  }

  @Get('recreation-lines')
  @ApiOperation({
    summary: 'Download recreation line features for BCGW ingestion',
    operationId: 'getBcgwRecreationLines',
    description:
      'Recreation trail/line features for the ' +
      'WHSE_FOREST_TENURE.FTEN_RECREATION_LINES_SVW layer. ' +
      REDIRECT_DESCRIPTION,
  })
  @ApiResponse({ status: 302, description: 'Redirect to the layer file' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESCRIPTION })
  @Redirect()
  async getRecreationLines() {
    return this.redirectTo('recreation-lines');
  }

  @Get('recreation-polygons')
  @ApiOperation({
    summary: 'Download recreation polygon features for BCGW ingestion',
    operationId: 'getBcgwRecreationPolygons',
    description:
      'Recreation polygon features for the ' +
      'WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW layer. ' +
      REDIRECT_DESCRIPTION,
  })
  @ApiResponse({ status: 302, description: 'Redirect to the layer file' })
  @ApiResponse({ status: 404, description: NOT_FOUND_DESCRIPTION })
  @Redirect()
  async getRecreationPolygons() {
    return this.redirectTo('recreation-polygons');
  }

  @Get('closures-fully-attributed/features')
  @UseGuards(AuthGuard(AUTH_STRATEGY.BCGW_KEYCLOAK))
  @ApiBearerAuth(AUTH_STRATEGY.BCGW_KEYCLOAK)
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized — missing, malformed, or expired bearer token. ' +
      'Obtain a token from CSS using the OAuth2 Client Credentials flow.',
  })
  @ApiOperation({
    summary: 'Page through recreation resources for BCGW ingestion',
    operationId: 'getBcgwClosuresFullyAttributedPage',
    description: PAGINATED_DESCRIPTION,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${pageSizeOf(
      'closures-fully-attributed',
    )} features.`,
  })
  @ApiOkResponse({ type: BcgwFeatureCollectionDto })
  async getClosuresFullyAttributedPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwFeatureCollectionDto> {
    return this.bcgwService.findLayerPage<BcgwRecreationResourceDto>(
      'closures-fully-attributed',
      page,
    );
  }

  @Get('closures-short/features')
  @ApiOperation({
    summary: 'Page through the short closures BCGW layer',
    operationId: 'getBcgwClosuresShortPage',
    description: PAGINATED_DESCRIPTION,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${pageSizeOf(
      'closures-short',
    )} features.`,
  })
  @ApiOkResponse({ type: BcgwClosuresShortFeatureCollectionDto })
  async getClosuresShortPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwClosuresShortFeatureCollectionDto> {
    return this.bcgwService.findLayerPage<BcgwClosuresShortDto>(
      'closures-short',
      page,
    );
  }

  @Get('recreation-lines/features')
  @ApiOperation({
    summary: 'Page through recreation line features for BCGW ingestion',
    operationId: 'getBcgwRecreationLinesPage',
    description: PAGINATED_DESCRIPTION,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${pageSizeOf(
      'recreation-lines',
    )} features.`,
  })
  @ApiOkResponse({ type: BcgwRecreationLinesFeatureCollectionDto })
  async getRecreationLinesPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwRecreationLinesFeatureCollectionDto> {
    return this.bcgwService.findLayerPage<BcgwRecreationLinesDto>(
      'recreation-lines',
      page,
    );
  }

  @Get('recreation-polygons/features')
  @ApiOperation({
    summary: 'Page through recreation polygon features for BCGW ingestion',
    operationId: 'getBcgwRecreationPolygonsPage',
    description: PAGINATED_DESCRIPTION,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${pageSizeOf(
      'recreation-polygons',
    )} features.`,
  })
  @ApiOkResponse({ type: BcgwRecreationPolygonsFeatureCollectionDto })
  async getRecreationPolygonsPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwRecreationPolygonsFeatureCollectionDto> {
    return this.bcgwService.findLayerPage<BcgwRecreationPolygonsDto>(
      'recreation-polygons',
      page,
    );
  }

  /**
   * Forces an export outside the schedule — after a deploy that changes the view
   * definitions, or after the FTA data load, when the stored files would
   * otherwise stay stale until the next scheduled run.
   */
  @Post('export')
  @UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
  @AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized — missing, malformed, or expired bearer token.',
  })
  @ApiOperation({
    summary: 'Run the BCGW layer export now',
    operationId: 'runBcgwExport',
    description:
      'Refreshes the BCGW materialized views and regenerates every layer file. ' +
      'Returns one manifest per exported layer, or an empty array when another ' +
      'run already holds the export lock.',
  })
  @ApiOkResponse({
    description: 'Manifests for the layers exported by this run',
    type: [BcgwLayerManifestDto],
  })
  async runExport(): Promise<BcgwLayerManifestDto[]> {
    return this.bcgwExportService.run();
  }

  private async redirectTo(layerName: string) {
    return {
      url: await this.bcgwService.getLayerDownloadUrl(layerName),
      statusCode: HttpStatus.FOUND,
    };
  }
}

import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
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

/**
 * Layers are delivered as pre-generated gzipped GeoJSON files in S3 rather than
 * built inline: the full datasets are far too large to serialize into a response
 * (recreation-lines alone is ~143 MB uncompressed). Each endpoint below redirects
 * to a presigned URL for the most recent export, so a single GET with redirects
 * followed downloads the whole layer.
 */
const REDIRECT_DESCRIPTION =
  'Redirects (302) to a presigned URL for the most recent export of this layer, ' +
  'a gzipped GeoJSON FeatureCollection. Clients must follow redirects. ' +
  'Files are regenerated on a schedule from materialized views, so the data is ' +
  'as fresh as the last export run.';

const NOT_FOUND_DESCRIPTION = 'No export has been produced for this layer yet.';

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

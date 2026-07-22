import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AUTH_STRATEGY } from '@/auth/auth.constants';
import { BcgwService } from './bcgw.service';
import { BcgwFeatureCollectionDto } from './dto/bcgw-recreation-resource.dto';
import { BcgwClosuresShortFeatureCollectionDto } from './dto/bcgw-closures-short.dto';
import { BcgwRecreationLinesFeatureCollectionDto } from './dto/bcgw-recreation-lines.dto';
import { BcgwRecreationPolygonsFeatureCollectionDto } from './dto/bcgw-recreation-polygons.dto';

@ApiTags('bcgw')
@Controller({ path: 'bcgw', version: '1' })
export class BcgwController {
  constructor(private readonly bcgwService: BcgwService) {}

  @Get('closures-fully-attributed')
  @UseGuards(AuthGuard(AUTH_STRATEGY.BCGW_KEYCLOAK))
  @ApiBearerAuth(AUTH_STRATEGY.BCGW_KEYCLOAK)
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized — missing, malformed, or expired bearer token. ' +
      'Obtain a token from CSS using the OAuth2 Client Credentials flow.',
  })
  @ApiOperation({
    summary: 'Get all recreation resources for BCGW ingestion',
    operationId: 'getBcgwClosuresFullyAttributed',
    description:
      'Returns a paginated GeoJSON FeatureCollection of recreation resources ' +
      'intended for ingestion by the BC Geographic Warehouse (BCGW) into the ' +
      'WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_FA_SV layer. ' +
      'Data is sourced from a pre-computed materialized view refreshed every 5 minutes.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${BcgwService.PAGE_SIZE} features.`,
  })
  @ApiResponse({
    status: 200,
    description: 'GeoJSON FeatureCollection of recreation resources',
    type: BcgwFeatureCollectionDto,
  })
  async getRecreationResources(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwFeatureCollectionDto> {
    return this.bcgwService.findAll(page);
  }

  @Get('recreation-lines')
  @ApiOperation({
    summary: 'Get recreation line features for BCGW ingestion',
    operationId: 'getBcgwRecreationLines',
    description:
      'Returns a paginated GeoJSON FeatureCollection of recreation trail/line features ' +
      'intended for ingestion by the BC Geographic Warehouse (BCGW) into the ' +
      'WHSE_FOREST_TENURE.FTEN_RECREATION_LINES_SVW layer. ' +
      'Data is sourced from a pre-computed materialized view refreshed every 5 minutes.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${BcgwService.PAGE_SIZE} features.`,
  })
  @ApiResponse({
    status: 200,
    description: 'GeoJSON FeatureCollection of recreation line features',
    type: BcgwRecreationLinesFeatureCollectionDto,
  })
  async getRecreationLines(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwRecreationLinesFeatureCollectionDto> {
    return this.bcgwService.findAllLines(page);
  }

  @Get('recreation-polygons')
  @ApiOperation({
    summary: 'Get recreation polygon features for BCGW ingestion',
    operationId: 'getBcgwRecreationPolygons',
    description:
      'Returns a paginated GeoJSON FeatureCollection of recreation polygon features ' +
      'intended for ingestion by the BC Geographic Warehouse (BCGW) into the ' +
      'WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW layer. ' +
      'Data is sourced from a pre-computed materialized view refreshed every 5 minutes.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${BcgwService.PAGE_SIZE} features.`,
  })
  @ApiResponse({
    status: 200,
    description: 'GeoJSON FeatureCollection of recreation polygon features',
    type: BcgwRecreationPolygonsFeatureCollectionDto,
  })
  async getRecreationPolygons(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwRecreationPolygonsFeatureCollectionDto> {
    return this.bcgwService.findAllPolygons(page);
  }

  @Get('closures-short')
  @ApiOperation({
    summary: 'Get recreation resources for the short closures BCGW layer',
    operationId: 'getBcgwClosuresShort',
    description:
      'Returns a paginated GeoJSON FeatureCollection of recreation resources ' +
      'intended for ingestion by the BC Geographic Warehouse (BCGW) into the ' +
      'WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_SV layer. ' +
      'A 20-column subset of the fully attributed closures layer.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: `Page number (1-indexed). Each page returns up to ${BcgwService.PAGE_SIZE} features.`,
  })
  @ApiResponse({
    status: 200,
    description: 'GeoJSON FeatureCollection of recreation resources',
    type: BcgwClosuresShortFeatureCollectionDto,
  })
  async getClosuresShort(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ): Promise<BcgwClosuresShortFeatureCollectionDto> {
    return this.bcgwService.findAllShort(page);
  }
}

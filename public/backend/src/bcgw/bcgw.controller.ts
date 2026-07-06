import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BcgwService } from './bcgw.service';
import { BcgwFeatureCollectionDto } from './dto/bcgw-recreation-resource.dto';
import { BcgwClosuresShortFeatureCollectionDto } from './dto/bcgw-closures-short.dto';

@ApiTags('bcgw')
@Controller({ path: 'bcgw', version: '1' })
export class BcgwController {
  constructor(private readonly bcgwService: BcgwService) {}

  @Get('recreation-resources')
  @ApiOperation({
    summary: 'Get all recreation resources for BCGW ingestion',
    operationId: 'getBcgwRecreationResources',
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

  @Get('closures-short')
  @ApiOperation({
    summary: 'Get recreation resources for the short closures BCGW layer',
    operationId: 'getBcgwClosuresShort',
    description:
      'Returns a paginated GeoJSON FeatureCollection of recreation resources ' +
      'intended for ingestion by the BC Geographic Warehouse (BCGW) into the ' +
      'WHSE_FOREST_TENURE.FTEN_REC_DTAILS_CLOSURES_SP layer. ' +
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

import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeospatialService } from './geospatial.service';

@ApiTags('geospatial')
@Controller({ path: 'geospatial', version: '1' })
export class GeospatialController {
  constructor(private readonly geospatialService: GeospatialService) {}

  @Post('bcgw')
  @ApiOperation({
    operationId: 'GeospatialController.getBcgwLayer',
    summary: 'Proxy for BCGW MapServer layers (temporary CORS workaround)',
    description:
      'Forwards requests to maps.gov.bc.ca server-side to bypass the CORS misconfiguration on BCGW. ' +
      'Only layer indices 3 (recreation trails) and 5 (recreation boundaries) are permitted. ' +
      'Filters by FOREST_FILE_ID so responses are bounded by the caller’s id list, not viewport density. ',
  })
  @ApiQuery({
    name: 'layer',
    description: 'BCGW layer index — 3 (trails) or 5 (boundaries)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'FOREST_FILE_ID values to fetch geometry for',
        },
      },
      required: ['ids'],
    },
  })
  getBcgwLayer(
    @Query('layer') layer: string,
    @Body() body: { ids?: unknown },
  ): Promise<unknown> {
    const ids = body?.ids;
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
      throw new BadRequestException(
        'Request body must include "ids" as an array of strings',
      );
    }
    return this.geospatialService.getBcgwLayer(layer, ids);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeospatialService } from './geospatial.service';

@ApiTags('geospatial')
@Controller({ path: 'geospatial', version: '1' })
export class GeospatialController {
  constructor(private readonly geospatialService: GeospatialService) {}

  @Get('bcgw')
  @ApiOperation({
    operationId: 'GeospatialController.getBcgwLayer',
    summary: 'Proxy for BCGW MapServer layers (temporary CORS workaround)',
    description:
      'Forwards requests to maps.gov.bc.ca server-side to bypass the CORS misconfiguration on BCGW. ' +
      'Only layer indices 3 (recreation trails) and 5 (recreation boundaries) are permitted. ' +
      'Remove this endpoint once the BCGW CORS ticket is resolved.',
  })
  @ApiQuery({
    name: 'layer',
    description: 'BCGW layer index — 3 (trails) or 5 (boundaries)',
  })
  @ApiQuery({
    name: 'extent',
    description:
      'Viewport bounding box as xmin,ymin,xmax,ymax in Web Mercator (EPSG:102100)',
  })
  getBcgwLayer(
    @Query('layer') layer: string,
    @Query('extent') extent: string,
  ): Promise<unknown> {
    return this.geospatialService.getBcgwLayer(layer, extent);
  }
}

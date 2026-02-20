import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import {
  Controller,
  Get,
  Put,
  Body,
  HttpException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RecreationResourceGeospatialDto } from './dto/recreation-resource-geospatial.dto';
import { UpdateRecreationResourceGeospatialDto } from './dto/update-recreation-resource-geospatial.dto';
import { GeospatialService } from './geospatial.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/geospatial',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class GeospatialController {
  constructor(private readonly geospatialService: GeospatialService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get()
  @ApiOperation({
    operationId: 'getRecreationResourceGeospatial',
    summary: 'Get geospatial data for a recreation resource',
    description:
      'Returns geospatial data including spatial feature geometries and calculated coordinate values',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiResponse({
    status: 200,
    description: 'Geospatial data for the recreation resource',
    type: RecreationResourceGeospatialDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Geospatial data not found',
  })
  async getGeospatialData(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceGeospatialDto> {
    const geospatialData =
      await this.geospatialService.findGeospatialDataById(rec_resource_id);

    if (!geospatialData) {
      throw new HttpException(
        'Geospatial data not found for this recreation resource.',
        404,
      );
    }

    return geospatialData;
  }

  @Put()
  @ApiOperation({
    operationId: 'updateRecreationResourceGeospatial',
    summary: 'Update geospatial data for a recreation resource',
    description:
      'Updates or inserts the site point geometry based on provided UTM fields (zone, easting, northing)',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiBody({ type: UpdateRecreationResourceGeospatialDto })
  @ApiOkResponse({
    description: 'Updated geospatial data for the recreation resource',
    type: RecreationResourceGeospatialDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors or invalid input',
  })
  async updateGeospatialData(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() updateDto: UpdateRecreationResourceGeospatialDto,
  ): Promise<RecreationResourceGeospatialDto> {
    // Service is responsible for upserting site point geometry based on UTM fields (zone, easting, northing).
    // It should also handle updates when a site_point row already exists.
    await this.geospatialService.updateGeospatialData(
      rec_resource_id,
      updateDto,
    );

    // Return the latest geospatial payload after the update
    const geospatialData =
      await this.geospatialService.findGeospatialDataById(rec_resource_id);

    if (!geospatialData) {
      throw new HttpException(
        'Geospatial data not found for this recreation resource after update.',
        404,
      );
    }

    return geospatialData;
  }
}

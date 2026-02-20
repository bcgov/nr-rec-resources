import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecreationFeatureDto } from './dtos/recreation-feature.dto';
import { UpdateFeaturesDto } from './dtos/update-features.dto';
import { FeaturesService } from './features.service';

@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
@Controller({ path: 'recreation-resources', version: '1' })
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get(':rec_resource_id/features')
  @ApiOperation({
    summary: 'Get all features related to the resource',
    operationId: 'getFeaturesByRecResourceId',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiResponse({
    status: 200,
    description: 'Features Found',
    type: [RecreationFeatureDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - invalid ID',
    type: BadRequestResponseDto,
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationFeatureDto[]> {
    try {
      return await this.featuresService.findAll(rec_resource_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error retrieving features', 500);
    }
  }

  @Put(':rec_resource_id/features')
  @ApiOperation({
    summary: 'Update features for a recreation resource',
    operationId: 'updateFeatures',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiBody({
    required: true,
    description: 'Feature codes to associate with the resource',
    type: UpdateFeaturesDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Features Updated',
    type: [RecreationFeatureDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async update(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: UpdateFeaturesDto,
  ): Promise<RecreationFeatureDto[]> {
    try {
      return await this.featuresService.update(
        rec_resource_id,
        body.feature_codes,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating features', 500);
    }
  }
}

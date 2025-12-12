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
  getSchemaPath,
} from '@nestjs/swagger';
import { RecreationActivityDto } from '../dtos/recreation-resource-detail.dto';
import { ActivitiesService } from './activities.service';
import { UpdateActivitiesDto } from './dtos/update-activities.dto';

@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
@Controller({ path: 'recreation-resources', version: '1' })
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get(':rec_resource_id/activities')
  @ApiOperation({
    summary: 'Get all activities related to the resource',
    operationId: 'getActivitiesByRecResourceId',
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
    description: 'Activities Found',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(RecreationActivityDto) },
    },
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
  ): Promise<RecreationActivityDto[]> {
    try {
      return await this.activitiesService.findAll(rec_resource_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error retrieving activities', 500);
    }
  }

  @Put(':rec_resource_id/activities')
  @ApiOperation({
    summary: 'Update activities for a recreation resource',
    operationId: 'updateActivities',
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
    description: 'Activity codes to associate with the resource',
    type: UpdateActivitiesDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Activities Updated',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(RecreationActivityDto) },
    },
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
    @Body() body: UpdateActivitiesDto,
  ): Promise<RecreationActivityDto[]> {
    try {
      return await this.activitiesService.update(
        rec_resource_id,
        body.activity_codes,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating activities', 500);
    }
  }
}

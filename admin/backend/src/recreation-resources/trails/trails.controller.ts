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
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RecreationTrailDto } from './dto/recreation-trail.dto';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { TrailsService } from './trails.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/trails',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Get()
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    operationId: 'getTrailsByRecResourceId',
    summary: 'Get all trails for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC160773',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trails for the recreation resource',
    type: [RecreationTrailDto],
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationTrailDto[]> {
    return this.trailsService.getAll(rec_resource_id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createTrail',
    summary: 'Create a new trail for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC160773',
  })
  @ApiBody({ type: CreateTrailDto })
  @ApiResponse({
    status: 201,
    description: 'Trail created successfully',
    type: RecreationTrailDto,
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiBadRequestResponse({
    description: 'Invalid trail data or activity is not accessible',
    type: BadRequestResponseDto,
  })
  async create(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() createTrailDto: CreateTrailDto,
  ): Promise<RecreationTrailDto> {
    try {
      return await this.trailsService.create(rec_resource_id, createTrailDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error creating trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':trail_id')
  @ApiOperation({
    operationId: 'updateTrail',
    summary: 'Update an existing trail',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC160773',
  })
  @ApiParam({ name: 'trail_id', description: 'Trail ID', example: 1 })
  @ApiBody({ type: UpdateTrailDto })
  @ApiResponse({
    status: 200,
    description: 'Trail updated successfully',
    type: RecreationTrailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Trail not found for this resource',
  })
  @ApiBadRequestResponse({
    description: 'Invalid trail data',
    type: BadRequestResponseDto,
  })
  async update(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('trail_id', ParseIntPipe) trail_id: number,
    @Body() updateTrailDto: UpdateTrailDto,
  ): Promise<RecreationTrailDto> {
    try {
      return await this.trailsService.update(
        rec_resource_id,
        trail_id,
        updateTrailDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error updating trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':trail_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteTrail',
    summary: 'Delete a trail',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC160773',
  })
  @ApiParam({ name: 'trail_id', description: 'Trail ID', example: 1 })
  @ApiNoContentResponse({ description: 'Trail deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Trail not found for this resource',
  })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('trail_id', ParseIntPipe) trail_id: number,
  ): Promise<void> {
    try {
      await this.trailsService.delete(rec_resource_id, trail_id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error deleting trail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

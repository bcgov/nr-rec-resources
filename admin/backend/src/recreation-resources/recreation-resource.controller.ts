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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RecreationResourceDetailDto } from './dtos/recreation-resource-detail.dto';
import { SuggestionsQueryDto } from './dtos/suggestions-query.dto';
import { SuggestionsResponseDto } from './dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from './dtos/update-recreation-resource.dto';
import { RecreationResourceService } from './recreation-resource.service';

/**
 * Controller for recreation resource endpoints.
 * Handles suggestions endpoint with input validation and authorization.
 */
@Controller('recreation-resources')
@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
  ) {}

  /**
   * GET /recreation-resource/suggestions
   *
   * Returns recreation resource suggestions based on a search term.
   * Only accessible to users with the 'rst-viewer' role.
   *
   * @param query - Query parameters containing the searchTerm
   * @returns SuggestionsResponseDto containing total and data array
   */
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get('suggestions')
  @ApiOkResponse({
    type: SuggestionsResponseDto,
    description: 'Successful retrieval of suggestions',
  })
  @ApiOperation({ operationId: 'getRecreationResourceSuggestions' })
  @ApiQuery({
    name: 'search_term',
    required: true,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async getSuggestions(
    @Query() query: SuggestionsQueryDto,
  ): Promise<SuggestionsResponseDto> {
    return await this.recreationResourceService.getSuggestions(
      query.search_term,
    );
  }

  /**
   * GET /recreation-resource/:id
   *
   * Returns a recreation resource by its ID.
   *
   * @param rec_resource_id - The ID of the recreation resource
   * @returns The recreation resource detail DTO
   */
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get(':rec_resource_id')
  @ApiOperation({
    summary: 'Find recreation resource by ID',
    operationId: 'getRecreationResourceById',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiOkResponse({
    description: 'Resource found',
    type: RecreationResourceDetailDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - invalid ID',
    type: BadRequestResponseDto,
  })
  async findOne(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceDetailDto> {
    const recResource =
      await this.recreationResourceService.findOne(rec_resource_id);
    if (!recResource) {
      throw new HttpException('Recreation Resource not found.', 404);
    }
    return recResource;
  }

  /**
   * PUT /recreation-resource/:id
   *
   * Updates a recreation resource by its ID. Intelligently handles both
   * direct table fields and related table fields based on request content.
   *
   * @param rec_resource_id - The ID of the recreation resource
   * @param updateData - The data to update
   * @returns The updated recreation resource detail DTO
   * @throws NotFoundException if resource not found
   * @throws BadRequestException if update data is invalid
   */
  @Put(':rec_resource_id')
  @ApiOperation({
    summary: 'Update recreation resource by ID',
    operationId: 'updateRecreationResourceById',
    description:
      'Updates a recreation resource. Automatically handles both direct fields and related table fields (description, driving_directions) based on the request content.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiBody({
    type: UpdateRecreationResourceDto,
    description:
      'Recreation resource update data. Must include at least one field to update.',
  })
  @ApiOkResponse({
    description: 'Resource updated successfully',
    type: RecreationResourceDetailDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors or invalid ID',
    type: BadRequestResponseDto,
  })
  async update(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() updateData: UpdateRecreationResourceDto,
  ): Promise<RecreationResourceDetailDto> {
    // Service layer will throw appropriate exceptions (NotFoundException, BadRequestException)
    // Controller just passes through - let NestJS exception filters handle HTTP responses
    return await this.recreationResourceService.update(
      rec_resource_id,
      updateData,
    );
  }
}

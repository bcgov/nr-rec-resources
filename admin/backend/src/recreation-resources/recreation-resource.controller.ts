import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  IsSuperAdmin,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import {
  Body,
  Controller,
  ForbiddenException,
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
import { AdminSearchQueryDto } from './dtos/admin-search-query.dto';
import { AdminSearchResponseDto } from './dtos/admin-search-response.dto';
import { SuggestionsQueryDto } from './dtos/suggestions-query.dto';
import { SuggestionsResponseDto } from './dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from './dtos/update-recreation-resource.dto';
import { RecreationResourceService } from './recreation-resource.service';
import { RecreationResourceRepository } from './recreation-resource.repository';

/**
 * Controller for recreation resource endpoints.
 * Handles suggestions endpoint with input validation and authorization.
 */
@Controller('recreation-resources')
@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles(
  [
    RecreationResourceAuthRole.RST_ADMIN,
    RecreationResourceAuthRole.RST_SUPER_ADMIN,
  ],
  ROLE_MODE.ANY,
)
export class RecreationResourceController {
  constructor(
    private readonly recreationResourceService: RecreationResourceService,
    private readonly recreationResourceRepository: RecreationResourceRepository,
  ) {}

  /**
   * GET /recreation-resources/search
   *
   * Returns paginated search results.
   * Archived resources are always visible when browsing (no text query).
   * When a text query is active, only super-admins see archived resources.
   *
   * @param query - Search / filter parameters
   * @param req - The HTTP request (used to resolve super-admin status from JWT roles)
   */
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get('search')
  @ApiOkResponse({
    type: AdminSearchResponseDto,
    description: 'Successful retrieval of admin search results',
  })
  @ApiOperation({
    operationId: 'searchRecreationResources',
    summary: 'Search recreation resources for admin',
  })
  async searchResources(
    @Query() query: AdminSearchQueryDto,
    @IsSuperAdmin() isSuperAdmin: boolean,
  ): Promise<AdminSearchResponseDto> {
    // Show archived resources when browsing the table (no text query) so all
    // admin users can see them.  When an active text search is applied, only
    // super-admins see archived results.
    const isTextSearch = Boolean(query.q?.trim());
    const includeArchived = !isTextSearch || isSuperAdmin;
    return await this.recreationResourceService.searchResources(query, {
      includeArchived,
    });
  }

  /**
   * GET /recreation-resources/suggestions
   *
   * Returns typeahead suggestions.
   * Archived resources are only suggested to super-admins.
   *
   * @param query - Contains the search_term
   * @param req - The HTTP request (used to resolve super-admin status from JWT roles)
   */
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
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
    @IsSuperAdmin() isSuperAdmin: boolean,
  ): Promise<SuggestionsResponseDto> {
    return await this.recreationResourceService.getSuggestions(
      query.search_term,
      { includeArchived: isSuperAdmin },
    );
  }

  /**
   * GET /recreation-resources/:rec_resource_id
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
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
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
   * PUT /recreation-resources/:rec_resource_id
   *
   * Updates a recreation resource by its ID.
   * Mirrors the frontend EditableGuard: only super-admins may edit archived resources.
   *
   * @param rec_resource_id - The ID of the recreation resource
   * @param updateData - The data to update
   * @param isSuperAdmin
   * @returns The updated recreation resource detail DTO
   * @throws ForbiddenException if a non-super-admin tries to edit an archived resource
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
    @IsSuperAdmin() isSuperAdmin: boolean,
  ): Promise<RecreationResourceDetailDto> {
    if (!isSuperAdmin) {
      const resource =
        await this.recreationResourceRepository.findOneById(rec_resource_id);
      if (resource?.rec_status_code === 'AR') {
        throw new ForbiddenException(
          'Only super-admins can edit archived resources.',
        );
      }
    }
    // Service layer will throw appropriate exceptions (NotFoundException, BadRequestException)
    // Controller just passes through - let NestJS exception filters handle HTTP responses
    return await this.recreationResourceService.update(
      rec_resource_id,
      updateData,
    );
  }
}

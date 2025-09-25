import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  HttpException,
} from '@nestjs/common';
import { SuggestionsQueryDto } from './dtos/suggestions-query.dto';
import { RecreationResourceService } from './recreation-resource.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SuggestionsResponseDto } from './dtos/suggestions-response.dto';
import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { AuthGuard } from '@nestjs/passport';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import { RecreationResourceDetailDto } from './dtos/recreation-resource-detail.dto';

/**
 * Controller for recreation resource endpoints.
 * Handles suggestions endpoint with input validation and authorization.
 */
@Controller('recreation-resource')
@ApiTags('recreation-resource')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
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
  @Get('suggestions')
  @ApiOkResponse({
    type: SuggestionsResponseDto,
    description: 'Successful retrieval of suggestions',
  })
  @ApiOperation({ operationId: 'getRecreationResourceSuggestions' })
  @ApiQuery({
    name: 'searchTerm',
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
      query.searchTerm,
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
}

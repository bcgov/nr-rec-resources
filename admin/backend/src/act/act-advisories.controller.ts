import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import { GenericErrorResponseDto } from '@/common/dtos/generic-error-response.dto';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
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
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActAdvisoryResponseDto } from './dtos/act-advisory-response.dto';
import { ActAdvisoryUpdateDto } from './dtos/act-advisory-update.dto';
import { ActAdvisoryUpsertDto } from './dtos/act-advisory-upsert.dto';
import { ActAdvisoriesService } from './act-advisories.service';
import { ACT_ADVISORIES_PATH, ACT_API_TAG } from './act.constants';

/**
 * Controller exposing the secure CUD (Create / Update / Delete) advisory
 * endpoints consumed by the Act integration.
 *
 * Authentication: CSS (Common Hosted Single Sign-On) issued bearer tokens
 *  obtained via the OAuth2 **Client Credentials** grant flow.
 *  - Tokens are validated by the Keycloak bearer Passport strategy.
 *  - Missing / malformed / expired tokens are rejected with 401.
 *
 * Authorization: requests must carry the `act-service` client role.
 *  Tokens without the role are rejected with 403 by {@link AuthRolesGuard}.
 *
 * All requests must include:
 *   Authorization: Bearer &lt;token&gt;
 */
@ApiTags(ACT_API_TAG)
@ApiExtraModels(
  ActAdvisoryUpsertDto,
  ActAdvisoryUpdateDto,
  ActAdvisoryResponseDto,
)
@ApiBearerAuth(AUTH_STRATEGY.ACT_KEYCLOAK)
@ApiOAuth2([], AUTH_STRATEGY.CSS_OAUTH2)
@ApiUnauthorizedResponse({
  description:
    'Unauthorized - missing, malformed, or expired bearer token. ' +
    'Act must obtain a new token from the CSS token endpoint using ' +
    'the OAuth2 Client Credentials flow.',
  type: GenericErrorResponseDto,
})
@UseGuards(AuthGuard(AUTH_STRATEGY.ACT_KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.ACT_SERVICE], ROLE_MODE.ALL)
@Controller({ path: ACT_ADVISORIES_PATH, version: '1' })
export class ActAdvisoriesController {
  constructor(private readonly actAdvisoriesService: ActAdvisoriesService) {}

  /**
   * POST /api/v1/act/advisories
   *
   * Upserts an advisory addressed by its natural key
   * (`rec_resource_id`, `advisory_number`).
   *
   * - If a matching row already exists, it is **updated** in place and the
   *   response includes `action: 'updated'` with HTTP 200.
   * - Otherwise a new row is **created** and the response includes
   *   `action: 'created'` with HTTP 201.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'upsertActAdvisory',
    summary: 'Create or update an advisory pushed from Act (upsert).',
    description:
      'Idempotent upsert of an advisory in `rst.act_advisories_flat`. ' +
      'The composite natural key (rec_resource_id, advisory_number) determines ' +
      'whether a record is created or updated.',
  })
  @ApiBody({
    type: ActAdvisoryUpsertDto,
    description: 'Full advisory payload pushed by Act.',
  })
  @ApiCreatedResponse({
    description: 'Advisory successfully created or updated.',
    type: ActAdvisoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error in the payload.',
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Recreation resource referenced by rec_resource_id not found.',
    type: GenericErrorResponseDto,
  })
  async upsert(
    @Body() payload: ActAdvisoryUpsertDto,
  ): Promise<ActAdvisoryResponseDto> {
    return this.actAdvisoriesService.upsert(payload);
  }

  /**
   * PUT /api/v1/act/advisories/:rec_resource_id/:advisory_number
   *
   * Partially updates an existing advisory addressed by its natural key.
   */
  @Put(':rec_resource_id/:advisory_number')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'updateActAdvisory',
    summary: 'Update an existing advisory pushed from Act.',
    description:
      'Partial update of an existing advisory in `rst.act_advisories_flat`. ' +
      'The composite natural key is supplied via URL path parameters.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Recreation resource ID the advisory applies to.',
    type: 'string',
    example: 'REC0002',
  })
  @ApiParam({
    name: 'advisory_number',
    required: true,
    description: 'Act advisory number.',
    type: 'integer',
    example: 3791,
  })
  @ApiBody({
    type: ActAdvisoryUpdateDto,
    description: 'Partial advisory payload. Only provided fields are updated.',
  })
  @ApiOkResponse({
    description: 'Advisory successfully updated.',
    type: ActAdvisoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation error in the payload or path parameters.',
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No advisory exists for the given natural key.',
    type: GenericErrorResponseDto,
  })
  async update(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('advisory_number', ParseIntPipe) advisory_number: number,
    @Body() payload: ActAdvisoryUpdateDto,
  ): Promise<ActAdvisoryResponseDto> {
    return this.actAdvisoriesService.update(
      { rec_resource_id, advisory_number },
      payload,
    );
  }

  /**
   * DELETE /api/v1/act/advisories/:rec_resource_id/:advisory_number
   *
   * Removes an advisory addressed by its natural key from
   * `rst.act_advisories_flat`. Act calls this when an advisory is
   * deleted on their end and should be immediately unlinked from ORCA.
   */
  @Delete(':rec_resource_id/:advisory_number')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'deleteActAdvisory',
    summary: 'Delete an advisory pushed from Act.',
    description:
      'Removes the advisory row in `rst.act_advisories_flat` for the given ' +
      'natural key. This is invoked by Act when the advisory is deleted ' +
      'on their side.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Recreation resource ID the advisory applies to.',
    type: 'string',
    example: 'REC0002',
  })
  @ApiParam({
    name: 'advisory_number',
    required: true,
    description: 'Act advisory number.',
    type: 'integer',
    example: 3791,
  })
  @ApiOkResponse({
    description: 'Advisory successfully deleted.',
    type: ActAdvisoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid path parameters.',
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No advisory exists for the given natural key.',
    type: GenericErrorResponseDto,
  })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('advisory_number', ParseIntPipe) advisory_number: number,
  ): Promise<ActAdvisoryResponseDto> {
    return this.actAdvisoriesService.delete({
      rec_resource_id,
      advisory_number,
    });
  }
}

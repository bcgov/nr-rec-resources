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
  applyDecorators,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
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
import { ActAdvisoryBulkResponseDto } from './dtos/act-advisory-bulk-response.dto';
import { ActAdvisoryBulkUpsertDto } from './dtos/act-advisory-bulk-upsert.dto';
import { ActAdvisoryResponseDto } from './dtos/act-advisory-response.dto';
import { ActAdvisoryUpdateDto } from './dtos/act-advisory-update.dto';
import { ActAdvisoryUpsertDto } from './dtos/act-advisory-upsert.dto';
import { ActAdvisoriesService } from './act-advisories.service';
import { ACT_ADVISORIES_PATH, ACT_API_TAG } from './act.constants';

// ---------------------------------------------------------------------------
// Shared example payloads
// ---------------------------------------------------------------------------

const ADVISORY_BASE_EXAMPLE = {
  advisory_number: 3791,
  title: 'Bear in area',
  submitted_by: 'jdoe',
  access_status_name: 'Open with restrictions',
  access_status_grouplabel: 'Open',
  event_type: 'Wildlife',
  urgency: 'High',
  advisory_status: 'Published',
  is_advisory_date_displayed: true,
  is_effective_date_displayed: true,
  is_end_date_displayed: false,
  advisory_date: '2026-06-01T15:00:00.000Z',
  effective_date: '2026-06-02T00:00:00.000Z',
  updated_date: '2026-06-05T08:30:00.000Z',
  modified_date: '2026-06-05T08:30:00.000Z',
  listing_rank: 0,
  urgency_sequence: 0,
  access_status_precedence: 0,
  event_type_precedence: 0,
};

const ADVISORY_NULLABLE_EXAMPLE = {
  ...ADVISORY_BASE_EXAMPLE,
  description: null,
  access_status_description: null,
  is_reservations_affected: null,
  is_updated_date_displayed: null,
  end_date: null,
  expiry_date: null,
  removal_date: null,
  published_date: null,
};

const ADVISORY_STANDARD_EXAMPLE = {
  ...ADVISORY_BASE_EXAMPLE,
  rec_resource_id: 'REC0002',
  description:
    'A black bear has been spotted near the main campground. Please use bear-safe storage.',
  access_status_description: 'The site is open but some trails are closed.',
  is_reservations_affected: false,
  is_updated_date_displayed: true,
  end_date: '2026-09-30T23:59:59.000Z',
  expiry_date: '2026-10-31T23:59:59.000Z',
  removal_date: '2026-11-15T00:00:00.000Z',
  published_date: '2026-06-02T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Shared decorator helpers
// ---------------------------------------------------------------------------

function ApiNaturalKeyParams() {
  return applyDecorators(
    ApiParam({
      name: 'rec_resource_id',
      required: true,
      description: 'Recreation resource ID the advisory applies to.',
      type: 'string',
      example: 'REC0002',
    }),
    ApiParam({
      name: 'advisory_number',
      required: true,
      description: 'Act advisory number.',
      type: 'integer',
      example: 3791,
    }),
  );
}

function ApiAdvisoryErrorResponses(notFoundDescription: string) {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation error in the payload.',
      type: BadRequestResponseDto,
    }),
    ApiNotFoundResponse({
      description: notFoundDescription,
      type: GenericErrorResponseDto,
    }),
  );
}

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
  ActAdvisoryBulkUpsertDto,
  ActAdvisoryBulkResponseDto,
  ActAdvisoryUpsertDto,
  ActAdvisoryUpdateDto,
  ActAdvisoryResponseDto,
)
@ApiOAuth2([], AUTH_STRATEGY.ACT_KEYCLOAK)
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
    examples: {
      standard: {
        summary: 'Typical advisory payload',
        value: ADVISORY_STANDARD_EXAMPLE,
      },
      nullableFields: {
        summary: 'Advisory payload with nullable fields set to null',
        value: { ...ADVISORY_NULLABLE_EXAMPLE, rec_resource_id: 'REC0002' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Advisory successfully created or updated.',
    type: ActAdvisoryResponseDto,
  })
  @ApiAdvisoryErrorResponses(
    'Recreation resource referenced by rec_resource_id not found.',
  )
  async upsert(
    @Body() payload: ActAdvisoryUpsertDto,
  ): Promise<ActAdvisoryResponseDto> {
    return this.actAdvisoriesService.upsert(payload);
  }

  /**
   * POST /api/v1/act/advisories/bulk
   *
   * Upserts the same advisory across multiple recreation resources in one
   * request. This is the chosen multi-resource optimization instead of
   * overloading the existing natural-key PUT / DELETE routes.
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'bulkUpsertActAdvisory',
    summary: 'Create or update the same advisory for multiple resources.',
    description:
      'Create or update the same advisory across multiple recreation resources in `rst.act_advisories_flat`. ' +
      'The request carries one advisory payload plus a `rec_resource_ids` array, and the backend ' +
      'creates or updates one row per `(rec_resource_id, advisory_number)`. ' +
      'Single-resource PUT and DELETE endpoints remain intentionally scoped to one natural key at a time.',
  })
  @ApiBody({
    type: ActAdvisoryBulkUpsertDto,
    description:
      'Bulk advisory payload pushed by Act. The same advisory content is upserted for each supplied rec_resource_id.',
    examples: {
      nullableFields: {
        summary: 'Bulk advisory payload with nullable fields shown explicitly',
        value: {
          ...ADVISORY_NULLABLE_EXAMPLE,
          rec_resource_ids: ['REC0002', 'REC0042'],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Bulk advisory upsert completed.',
    type: ActAdvisoryBulkResponseDto,
  })
  @ApiAdvisoryErrorResponses(
    'One or more recreation resources referenced by rec_resource_ids were not found.',
  )
  async bulkUpsert(
    @Body() payload: ActAdvisoryBulkUpsertDto,
  ): Promise<ActAdvisoryBulkResponseDto> {
    return this.actAdvisoriesService.bulkUpsert(payload);
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
  @ApiNaturalKeyParams()
  @ApiBody({
    type: ActAdvisoryUpdateDto,
    description: 'Partial advisory payload. Only provided fields are updated.',
    examples: {
      fullPayload: {
        summary: 'Full payload',
        value: {
          title: 'Bear activity expanded near lake trail',
          description:
            'Bear activity has expanded to the lake trail area. Visitors should avoid the shoreline trail until further notice.',
          submitted_by: 'jdoe',
          access_status_name: 'Closed',
          access_status_grouplabel: 'Closed',
          access_status_description:
            'The shoreline trail is temporarily closed for public safety.',
          event_type: 'Wildlife',
          urgency: 'High',
          advisory_status: 'Published',
          is_reservations_affected: false,
          is_advisory_date_displayed: true,
          is_effective_date_displayed: true,
          is_end_date_displayed: true,
          is_updated_date_displayed: true,
          advisory_date: '2026-06-01T15:00:00.000Z',
          effective_date: '2026-06-02T00:00:00.000Z',
          end_date: '2026-09-30T23:59:59.000Z',
          expiry_date: '2026-10-31T23:59:59.000Z',
          removal_date: '2026-11-15T00:00:00.000Z',
          updated_date: '2026-06-05T08:30:00.000Z',
          modified_date: '2026-06-05T08:30:00.000Z',
          published_date: '2026-06-02T00:00:00.000Z',
          listing_rank: 0,
          urgency_sequence: 0,
          access_status_precedence: 0,
          event_type_precedence: 0,
        },
      },
      nullableFields: {
        summary: 'Payload with nullable fields = null',
        value: {
          title: 'Bear activity expanded near lake trail',
          submitted_by: 'jdoe',
          access_status_name: 'Closed',
          access_status_grouplabel: 'Closed',
          event_type: 'Wildlife',
          urgency: 'High',
          advisory_status: 'Published',
          is_advisory_date_displayed: true,
          is_effective_date_displayed: true,
          is_end_date_displayed: true,
          description: null,
          access_status_description: null,
          is_reservations_affected: null,
          is_updated_date_displayed: null,
          advisory_date: '2026-06-01T15:00:00.000Z',
          effective_date: '2026-06-02T00:00:00.000Z',
          end_date: null,
          expiry_date: null,
          removal_date: null,
          updated_date: '2026-06-05T08:30:00.000Z',
          modified_date: '2026-06-05T08:30:00.000Z',
          published_date: null,
          listing_rank: 0,
          urgency_sequence: 0,
          access_status_precedence: 0,
          event_type_precedence: 0,
        },
      },
    },
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
  @ApiNaturalKeyParams()
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

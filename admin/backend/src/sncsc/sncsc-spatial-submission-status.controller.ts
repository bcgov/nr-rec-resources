import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOAuth2,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateSpatialSubmissionStatusDto } from './dtos/update-spatial-submission-status.dto';
import {
  SNCSC_API_TAG,
  SNCSC_SPATIAL_SUBMISSIONS_PATH,
  SNCSC_STATUS_RESOURCE_TYPE,
} from './sncsc.constants';
import { SncscSpatialSubmissionStatusService } from './sncsc-spatial-submission-status.service';

@ApiTags(SNCSC_API_TAG)
@ApiOAuth2([], AUTH_STRATEGY.SNCSC_KEYCLOAK)
@ApiUnauthorizedResponse({
  description:
    'Unauthorized - missing, malformed, or expired bearer token. Obtain a CSS token using OAuth2 Client Credentials.',
})
@UseGuards(AuthGuard(AUTH_STRATEGY.SNCSC_KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.SNCSC_SERVICE], ROLE_MODE.ALL)
@Controller({ path: SNCSC_SPATIAL_SUBMISSIONS_PATH, version: '1' })
export class SncscSpatialSubmissionStatusController {
  constructor(
    private readonly spatialSubmissionStatusService: SncscSpatialSubmissionStatusService,
  ) {}

  @Put(':application_guid/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'updateSpatialSubmissionStatusFromSncsc',
    summary: 'Update a spatial submission adjudication status from SNCSC',
    description:
      'Consumes SNCSC PermitApplicationStatusResource payload and applies status/adjudication updates to rst.recreation_spatial_submission.',
  })
  @ApiParam({
    name: 'application_guid',
    description: 'Spatial submission application GUID.',
    example: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
  })
  @ApiBadRequestResponse({
    description: `Invalid payload or business-rule violation. '@type' must be '${SNCSC_STATUS_RESOURCE_TYPE}'.`,
  })
  @ApiNotFoundResponse({
    description:
      'No spatial submission exists for the provided application_guid.',
  })
  async updateSpatialSubmissionStatus(
    @Param('application_guid') applicationGuid: string,
    @Body() payload: UpdateSpatialSubmissionStatusDto,
  ): Promise<void> {
    await this.spatialSubmissionStatusService.updateStatus(
      applicationGuid,
      payload,
    );
  }
}

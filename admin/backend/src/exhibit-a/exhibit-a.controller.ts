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
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiExtraModels,
  ApiBody,
  ApiParam,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CreateExhibitAByApplicationGuidRequestDto,
  CreateExhibitAByApplicationGuidResultDto,
} from './dto/generate-exhibit-a.dto';
import { ExhibitAService } from './exhibit-a.service';

@ApiTags('sncsc')
@ApiExtraModels(CreateExhibitAByApplicationGuidResultDto)
@ApiOAuth2([], AUTH_STRATEGY.SNCSC_KEYCLOAK)
@ApiUnauthorizedResponse({
  description:
    'Unauthorized - missing, malformed, or expired bearer token. Obtain a CSS token using OAuth2 Client Credentials.',
})
@UseGuards(AuthGuard(AUTH_STRATEGY.SNCSC_KEYCLOAK), AuthRolesGuard)
@AuthRoles(
  [
    RecreationResourceAuthRole.SNCSC_SERVICE,
    RecreationResourceAuthRole.RST_SUPER_ADMIN,
  ],
  ROLE_MODE.ANY,
)
@Controller({ path: 'exhibit-a', version: '1' })
export class ExhibitAController {
  constructor(private readonly exhibitAService: ExhibitAService) {}

  @Post(':application_guid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'createOrGetExhibitAByApplicationGuid',
    summary:
      'Generate or retrieve Exhibit A by spatial submission application GUID.',
    description:
      'Updates spatial submission adjudication comments/audit fields and either generates a new Exhibit A or returns the latest existing Exhibit A URL for the submission.',
  })
  @ApiParam({
    name: 'application_guid',
    required: true,
    type: String,
    description: 'Spatial submission application GUID.',
    example: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
  })
  @ApiBody({ type: CreateExhibitAByApplicationGuidRequestDto })
  @ApiOkResponse({
    description: 'Exhibit A URL and metadata for the submission.',
    type: CreateExhibitAByApplicationGuidResultDto,
  })
  async createOrGetByApplicationGuid(
    @Param('application_guid') applicationGuid: string,
    @Body() body: CreateExhibitAByApplicationGuidRequestDto,
  ): Promise<CreateExhibitAByApplicationGuidResultDto> {
    return this.exhibitAService.createOrGetByApplicationGuid(
      applicationGuid,
      body,
    );
  }
}

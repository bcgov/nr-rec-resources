import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdvisoriesService } from './advisories.service';
import { RecreationResourceAdvisoryDto } from './dto/recreation-resource-advisory.dto';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/advisories',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get()
  @ApiOperation({
    operationId: 'getRecreationResourceAdvisories',
    summary: 'Get advisories and closures for a recreation resource',
    description:
      'Returns a priority-sorted list of advisories and closures for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiResponse({
    status: 200,
    description: 'Advisories for the recreation resource',
    type: [RecreationResourceAdvisoryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAdvisories(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceAdvisoryDto[]> {
    return this.advisoriesService.findAdvisoriesByRecResourceId(
      rec_resource_id,
    );
  }
}

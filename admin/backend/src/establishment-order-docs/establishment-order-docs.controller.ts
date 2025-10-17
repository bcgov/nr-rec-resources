import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EstablishmentOrderDocsService } from './establishment-order-docs.service';
import { EstablishmentOrderDocDto } from './dto/establishment-order-doc.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';

@ApiTags('recreation-resource')
@Controller({
  path: 'recreation-resources/:rec_resource_id/establishment-order-docs',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
export class EstablishmentOrderDocsController {
  constructor(
    private readonly establishmentOrderDocsService: EstablishmentOrderDocsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all establishment order documents for a recreation resource',
    description:
      'Returns a list of establishment order documents with presigned URLs for download',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiResponse({
    status: 200,
    description: 'List of establishment order documents',
    type: [EstablishmentOrderDocDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource not found',
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<EstablishmentOrderDocDto[]> {
    return this.establishmentOrderDocsService.getAll(rec_resource_id);
  }
}

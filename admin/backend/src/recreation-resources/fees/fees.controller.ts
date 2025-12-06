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
import { RecreationFeeDto } from './dto/recreation-fee.dto';
import { FeesService } from './fees.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/fees',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  @ApiOperation({
    operationId: 'getRecreationResourceFees',
    summary: 'Get all fees for a recreation resource',
    description:
      'Returns a list of fees for the recreation resource, sorted by fee type and start date',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiResponse({
    status: 200,
    description: 'List of fees for the recreation resource',
    type: [RecreationFeeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationFeeDto[]> {
    return this.feesService.getAll(rec_resource_id);
  }
}

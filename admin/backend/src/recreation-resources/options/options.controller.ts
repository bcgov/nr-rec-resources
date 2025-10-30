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
import { OptionDto } from './dtos/option.dto';
import { VALID_OPTION_TYPES } from './options.constants';
import { OptionsService } from './options.service';

@Controller({ path: 'recreation-resources/options', version: '1' })
@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get(':type')
  @ApiOperation({
    summary: 'List all options for a type',
    operationId: 'getOptionsByType',
    description: `Retrieve all available values for a given option type. Valid types: ${VALID_OPTION_TYPES.join(', ')}`,
  })
  @ApiParam({
    name: 'type',
    description: 'Option type',
    enum: VALID_OPTION_TYPES,
  })
  @ApiResponse({
    status: 200,
    description: 'List of options',
    type: [OptionDto],
  })
  async findAllByType(@Param('type') type: string): Promise<OptionDto[]> {
    return this.optionsService.findAllByType(type);
  }
}

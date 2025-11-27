import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetOptionsByTypesQueryDto } from './dtos/get-options-by-types-query.dto';
import { OptionDto } from './dtos/option.dto';
import { OptionsByTypeDto } from './dtos/options-by-type.dto';
import { type OptionType, VALID_OPTION_TYPES } from './options.constants';
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
  async findAllByType(@Param('type') type: OptionType): Promise<OptionDto[]> {
    return this.optionsService.findAllByType(type);
  }

  @Get()
  @ApiOperation({
    summary: 'List options for multiple types',
    operationId: 'getOptionsByTypes',
    description:
      'Retrieve options for multiple option types. Provide a comma-separated list of types in the `types` query parameter.\n\n' +
      'The order of elements in the response matches the order of types provided by the client.',
  })
  @ApiQuery({
    name: 'types',
    description:
      'Comma-separated list of option types. The response preserves the order of types in this list and returns one entry per requested type.',
    required: true,
    example: VALID_OPTION_TYPES.slice(0, 3).join(','),
  })
  @ApiResponse({
    status: 200,
    description:
      'List of options grouped by type. Each array element corresponds to a requested type in the same order as the input list.',
    type: [OptionsByTypeDto],
  })
  async findAllByTypes(
    @Query(new ValidationPipe({ transform: true }))
    query: GetOptionsByTypesQueryDto,
  ): Promise<OptionsByTypeDto[]> {
    const resultMap = await this.optionsService.findAllByTypes(query.types);

    // Preserve the order and keys requested by the client.
    return query.types.map((t) => ({
      type: t as OptionType,
      options: resultMap[t] ?? [],
    }));
  }
}

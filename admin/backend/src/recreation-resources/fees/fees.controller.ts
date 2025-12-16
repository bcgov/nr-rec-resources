import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRecreationFeeDto } from './dto/create-recreation-fee.dto';
import { RecreationFeeDto } from './dto/recreation-fee.dto';
import { FeesService } from './fees.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/fees',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  @AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
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

  @Post()
  @AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
  @ApiOperation({
    operationId: 'createRecreationResourceFee',
    summary: 'Create a new fee for a recreation resource',
    description:
      'Creates a new fee and associates it with the recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiBody({
    required: true,
    description: 'Fee data to create',
    type: CreateRecreationFeeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Fee created successfully',
    type: RecreationFeeDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource or fee type not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Fee type already exists for this resource',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async create(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() createFeeDto: CreateRecreationFeeDto,
  ): Promise<RecreationFeeDto> {
    try {
      return await this.feesService.create(rec_resource_id, createFeeDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating fee', 500);
    }
  }
}

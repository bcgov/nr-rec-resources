import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  DefaultValuePipe,
  HttpException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import { AgreementHolderClientPublicViewDto } from './dtos/agreement-holder-client-public-view.dto';
import { PartnerService } from './partner.service';
import { ClientPublicViewDto } from './dtos/client-public-view.dto';
import { ClientLocationDto } from './dtos/client-location.dto';
import { CreateAgreementHolderDto } from './dtos/create-agreement-holder.dto';
import { UpdateAgreementHolderDto } from './dtos/update-agreement-holder.dto';

@ApiTags('partners')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles(
  [
    RecreationResourceAuthRole.RST_ADMIN,
    RecreationResourceAuthRole.RST_SUPER_ADMIN,
  ],
  ROLE_MODE.ANY,
)
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  private setTotalCountHeader(
    response: Response,
    totalCount: number | null,
  ): void {
    if (totalCount !== null) {
      response.setHeader('X-Total-Count', String(totalCount));
    }
  }

  @Get('search/by')
  @ApiOperation({
    summary: 'Search for partners',
    description:
      'Search for partners based on the provided parameters. It uses a fuzzy match to search for the partner name. The cutout for the fuzzy match is 0.8. The search is case insensitive.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'acronym', required: false, type: String })
  @ApiQuery({ name: 'number', required: false, type: String })
  @ApiOkResponse({
    description: 'Successfully retrieved partners',
    type: [ClientPublicViewDto],
  })
  async searchByAcronymNameNumber(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Res({ passthrough: true }) response: Response,
    @Query('name') name?: string,
    @Query('acronym') acronym?: string,
    @Query('number') number?: string,
  ): Promise<ClientPublicViewDto[]> {
    const result = await this.partnerService.searchByAcronymNameNumber(
      page,
      size,
      name,
      acronym,
      number,
    );

    this.setTotalCountHeader(response, result.totalCount);
    return result.data;
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for partner by client id',
    description:
      'Looks up a single partner by client id using the forest client findByClientNumber API. Returns active and inactive clients.',
  })
  @ApiQuery({
    name: 'client_id',
    description: 'A single client id, for example 00000002.',
    required: true,
    type: String,
    example: '00000002',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved partner',
    type: ClientPublicViewDto,
  })
  async searchClient(
    @Query('client_id') clientId?: string,
  ): Promise<ClientPublicViewDto> {
    if (!clientId?.trim()) {
      throw new HttpException('Query parameter client_id is required', 400);
    }

    return await this.partnerService.searchClient(clientId);
  }

  @Get('recreation-resources/:rec_resource_id')
  @ApiOperation({
    summary: 'Get partners by recreation resource ID',
    description:
      'Looks up the agreement holder for the given recreation resource and returns partner details for the associated client number.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved partners for the recreation resource',
    type: [AgreementHolderClientPublicViewDto],
  })
  @ApiNotFoundResponse({
    description: 'Recreation resource not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - invalid ID',
    type: BadRequestResponseDto,
  })
  async findClientsByRecResourceId(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<AgreementHolderClientPublicViewDto[]> {
    return await this.partnerService.findClientsByRecResourceId(
      rec_resource_id,
    );
  }

  @Post('recreation-resources/:rec_resource_id')
  @ApiOperation({
    summary: 'Add agreement holder for a recreation resource',
    description:
      'Creates a new agreement holder record for the recreation resource when a client is assigned.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiBody({
    type: CreateAgreementHolderDto,
    description: 'Agreement holder data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Agreement holder created successfully',
    type: AgreementHolderClientPublicViewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource or client not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Agreement holder already exists for this recreation resource',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async createAgreementHolder(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() createDto: CreateAgreementHolderDto,
  ): Promise<AgreementHolderClientPublicViewDto> {
    return await this.partnerService.createAgreementHolder(
      rec_resource_id,
      createDto,
    );
  }

  @Put('recreation-resources/:rec_resource_id')
  @ApiOperation({
    summary: 'Edit agreement holder dates for a recreation resource',
    description:
      'Updates the agreement start date and/or agreement end date for an existing agreement holder record.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC0002',
  })
  @ApiBody({
    type: UpdateAgreementHolderDto,
    description: 'Agreement holder fields to update',
  })
  @ApiOkResponse({
    description: 'Agreement holder updated successfully',
    type: AgreementHolderClientPublicViewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Agreement holder not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async updateAgreementHolder(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() updateDto: UpdateAgreementHolderDto,
  ): Promise<AgreementHolderClientPublicViewDto> {
    return await this.partnerService.updateAgreementHolder(
      rec_resource_id,
      updateDto,
    );
  }

  @Get(':client_id')
  @ApiOperation({ summary: 'Get partner locations by client id' })
  @ApiParam({
    name: 'client_id',
    required: true,
    example: '00000001',
  })
  @ApiOkResponse({
    description: 'Returns a list of partner locations',
    type: [ClientLocationDto],
  })
  @ApiNotFoundResponse({
    description: 'Partner not found',
  })
  async listClientLocations(
    @Param('client_id') clientId: string,
  ): Promise<ClientLocationDto[]> {
    return await this.partnerService.listClientLocations(clientId);
  }
}

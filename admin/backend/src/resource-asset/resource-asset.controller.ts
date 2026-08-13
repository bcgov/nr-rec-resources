import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateRecreationAssetDto,
  CreateRecreationAssetRepairDto,
  RecreationAssetBulkRepairDto,
  RecreationAssetBulkUpdateDto,
  RecreationAssetDto,
  RecreationAssetRepairDto,
  UpdateRecreationAssetDto,
  UpdateRecreationAssetRepairDto,
} from './dto';
import { RecreationAssetService } from './service/resource-asset.service';

/**
 * Controller for recreation resource assets.
 * Handles endpoints with input validation and authorization.
 */
@Controller('v1/assets')
@ApiTags('assets')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles(
  [
    RecreationResourceAuthRole.RST_ADMIN,
    RecreationResourceAuthRole.RST_SUPER_ADMIN,
  ],
  ROLE_MODE.ANY,
)
export class RecreationAssetController {
  constructor(private readonly assetService: RecreationAssetService) {}

  // =========================================================================
  // RECREATION ASSET ENDPOINTS
  // =========================================================================

  @Post()
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({ summary: 'Create a new recreation asset' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecreationAssetDto,
  })
  async createAsset(
    @Body() dto: CreateRecreationAssetDto,
  ): Promise<RecreationAssetDto> {
    return this.assetService.createAsset(dto);
  }

  @Get()
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({ summary: 'Retrieve all recreation assets' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RecreationAssetDto],
  })
  async findAllAssets(): Promise<RecreationAssetDto[]> {
    return this.assetService.findAllAssets();
  }

  @Get(':id')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({ summary: 'Find a recreation asset by ID' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecreationAssetDto,
  })
  async findAssetById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RecreationAssetDto> {
    return this.assetService.findAssetById(id);
  }

  @Patch('bulk-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update common fields across multiple recreation assets',
  })
  @ApiResponse({
    status: 200,
    description: 'Assets updated successfully.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 3 },
      },
    },
  })
  async bulkUpdateAssets(
    @Body() dto: RecreationAssetBulkUpdateDto,
  ): Promise<{ count: number }> {
    return this.assetService.bulkUpdateAssets(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing recreation asset' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecreationAssetDto,
  })
  async updateAsset(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecreationAssetDto,
  ): Promise<RecreationAssetDto> {
    return this.assetService.updateAsset(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a recreation asset' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteAsset(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetService.deleteAsset(id);
  }

  // =========================================================================
  // RECREATION ASSET REPAIR ENDPOINTS
  // =========================================================================

  @Post(':id/repairs')
  @ApiOperation({ summary: 'Create a repair record for an asset' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RecreationAssetRepairDto,
  })
  async createRepair(
    @Param('id', ParseIntPipe) assetId: number,
    @Body() dto: CreateRecreationAssetRepairDto,
  ): Promise<RecreationAssetRepairDto> {
    return this.assetService.createRepair({ ...dto, asset_id: assetId });
  }

  @Get(':id/repairs')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({ summary: 'Get all repair records for an asset' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RecreationAssetRepairDto],
  })
  async findRepairsByAssetId(
    @Param('id', ParseIntPipe) assetId: number,
  ): Promise<RecreationAssetRepairDto[]> {
    return this.assetService.findRepairsByAssetId(assetId);
  }

  @Patch('repairs/:repairId')
  @ApiOperation({ summary: 'Update a repair record' })
  @ApiParam({ name: 'repairId', description: 'Repair ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecreationAssetRepairDto,
  })
  async updateRepair(
    @Param('repairId', ParseIntPipe) repairId: number,
    @Body() dto: UpdateRecreationAssetRepairDto,
  ): Promise<RecreationAssetRepairDto> {
    return this.assetService.updateRepair(repairId, dto);
  }

  @Delete('repairs/:repairId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a repair record' })
  @ApiParam({ name: 'repairId', description: 'Repair ID', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteRepair(
    @Param('repairId', ParseIntPipe) repairId: number,
  ): Promise<void> {
    return this.assetService.deleteRepair(repairId);
  }

  @Post('bulk-repairs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk create or record repairs across multiple recreation assets',
    description:
      'Applies a common repair code and completion date across multiple grouped asset IDs with varying costs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk repairs applied successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload structure or missing required fields.',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more provided asset_ids do not exist.',
  })
  async bulkCreateRepairs(
    @Body() dto: RecreationAssetBulkRepairDto,
  ): Promise<void> {
    return this.assetService.bulkUpsertRepairs(dto);
  }
}

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
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  BulkAssetUpdateResponseDto,
  CreateRecreationAssetDto,
  CreateRecreationAssetRepairDto,
  FindAllAssetsQueryDto,
  PaginatedRecreationAssetDto,
  RecreationAssetBulkRepairDto,
  RecreationAssetBulkUpdateDto,
  RecreationAssetCodeDto,
  RecreationAssetDto,
  RecreationAssetRepairDto,
  RecreationRepairCodeDto,
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
  @ApiOperation({
    summary: 'Create a new recreation asset',
    operationId: 'createRecreationAsset',
  })
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
  @ApiOperation({
    summary: 'Retrieve recreation assets with filtering and pagination',
    operationId: 'getPaginatedRecreationAssets',
  })
  @ApiParam({
    name: 'include_repair',
    description: 'Include repair records',
    type: Boolean,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedRecreationAssetDto,
  })
  async findAllAssets(
    @Query() query: FindAllAssetsQueryDto,
  ): Promise<PaginatedRecreationAssetDto> {
    return this.assetService.findAllAssets(query);
  }

  // =========================================================================
  // RECREATION ASSET CODE (LOOKUP TABLE) ENDPOINTS
  // Declared before ':id' so 'codes' isn't captured as a numeric asset id param.
  // =========================================================================

  @Get('codes')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    operationId: 'RecreationAssetController_findAllAssetCodes',
    summary: 'Retrieve all recreation asset type codes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RecreationAssetCodeDto],
  })
  async findAllAssetCodes(): Promise<RecreationAssetCodeDto[]> {
    return this.assetService.findAllAssetCodes();
  }

  // =========================================================================
  // RECREATION REPAIR CODE (LOOKUP TABLE) ENDPOINTS
  // Declared before ':id' so 'repair-codes' isn't captured as a numeric asset id param.
  // =========================================================================

  @Get('repair-codes')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    operationId: 'RecreationAssetController_findAllRepairCodes',
    summary: 'Retrieve all recreation asset repair codes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RecreationRepairCodeDto],
  })
  async findAllRepairCodes(): Promise<RecreationRepairCodeDto[]> {
    return this.assetService.findAllRepairCodes();
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
  @ApiOperation({
    summary: 'Find a recreation asset by ID',
    operationId: 'getRecreationAssetById',
  })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiParam({
    name: 'include_repair',
    description: 'Include repair records',
    type: Boolean,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RecreationAssetDto,
  })
  async findAssetById(
    @Param('id', ParseIntPipe) id: number,
    @Query('include_repair', new ParseBoolPipe({ optional: true }))
    includeRepair: boolean = false,
  ): Promise<RecreationAssetDto> {
    return this.assetService.findAssetById(id, includeRepair);
  }

  @Patch('bulk-update')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update common fields across multiple recreation assets',
    operationId: 'bulkUpdateRecreationAssets',
  })
  @ApiResponse({
    status: 200,
    description: 'Assets updated successfully.',
    type: BulkAssetUpdateResponseDto,
  })
  async bulkUpdateAssets(
    @Body() dto: RecreationAssetBulkUpdateDto,
  ): Promise<BulkAssetUpdateResponseDto> {
    return this.assetService.bulkUpdateAssets(dto);
  }

  @Patch(':id')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    summary: 'Update an existing recreation asset',
    operationId: 'updateRecreationAsset',
  })
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
  @AuthRoles([RecreationResourceAuthRole.RST_SUPER_ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a recreation asset',
    operationId: 'deleteRecreationAsset',
  })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteAsset(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetService.deleteAsset(id);
  }

  // =========================================================================
  // RECREATION ASSET REPAIR ENDPOINTS
  // =========================================================================

  @Post(':id/repairs')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    summary: 'Create a repair record for an asset',
    operationId: 'createAssetRepair',
  })
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
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    summary: 'Get all repair records for an asset',
    operationId: 'getAssetRepairs',
  })
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
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    summary: 'Update a repair record',
    operationId: 'updateAssetRepair',
  })
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
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a repair record',
    operationId: 'deleteAssetRepair',
  })
  @ApiParam({ name: 'repairId', description: 'Repair ID', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async deleteRepair(
    @Param('repairId', ParseIntPipe) repairId: number,
  ): Promise<void> {
    return this.assetService.deleteRepair(repairId);
  }

  @Post('bulk-repairs')
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk create repairs across multiple recreation assets',
    operationId: 'bulkInsertAssetRepairs',
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
    return this.assetService.bulkInsertRepairs(dto);
  }
}

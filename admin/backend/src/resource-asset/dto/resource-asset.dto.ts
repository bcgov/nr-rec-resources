import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { RecreationAssetRepairDto } from './resource-asset-repair.dto';

/**
 * Base DTO containing shared asset attributes
 */
export class BaseRecreationAssetDto {
  @ApiPropertyOptional({
    description: 'ID of the parent container asset',
    example: 100,
    type: Number,
    nullable: true,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  parent_id?: number | null;

  @ApiPropertyOptional({
    description: 'Physical barcode or field tag',
    example: 'CS-012',
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  asset_tag?: string | null;

  @ApiProperty({
    description: 'FK to the parent Recreation Resource',
    example: 'REC1222',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  rec_resource_id: string;

  @ApiProperty({
    description: 'FK to the parent Recreation Structure',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  asset_code: number;

  @ApiPropertyOptional({
    description: 'Optional display name',
    example: 'Campsite #12 Table',
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  asset_name?: string | null;

  @ApiPropertyOptional({
    description: 'Free-text note',
    example: 'Located near river',
    type: String,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  asset_comment?: string | null;

  @ApiPropertyOptional({
    description: 'Legacy aggregate structure reference ID',
    example: 'LEG-884',
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  legacy_structure_id?: string | null;

  @ApiPropertyOptional({
    description: 'Total length in metres',
    example: 12.5,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_length?: number | null;

  @ApiPropertyOptional({
    description: 'Total width in metres',
    example: 3.0,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_width?: number | null;

  @ApiPropertyOptional({
    description: 'Total area in square metres',
    example: 37.5,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_area?: number | null;

  @ApiPropertyOptional({
    description: 'Actual monetary value',
    example: 1800.5,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  actual_value?: number | null;

  @ApiPropertyOptional({
    description: 'Date the asset was installed (YYYY-MM-DD)',
    example: '2023-05-15',
    type: String,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  installation_date?: string | null;

  @ApiPropertyOptional({
    description: 'Point geometry type code, if this asset has a location',
    example: 'PT',
    nullable: true,
  })
  @IsOptional()
  geometry_type_code?: string | null;

  @ApiPropertyOptional({
    description: 'Latitude in WGS84 (derived from recreation_asset_geom)',
    example: 49.94212,
    nullable: true,
  })
  @IsOptional()
  latitude?: number | null;

  @ApiPropertyOptional({
    description: 'Longitude in WGS84 (derived from recreation_asset_geom)',
    example: -123.03604,
    nullable: true,
  })
  @IsOptional()
  longitude?: number | null;
}

/**
 * Payload for creating a new Recreation Asset
 */
export class CreateRecreationAssetDto extends BaseRecreationAssetDto {}

/**
 * Payload for updating an existing Recreation Asset (all base/create fields optional)
 */
export class UpdateRecreationAssetDto extends PartialType(
  CreateRecreationAssetDto,
) {}

/**
 * Full Read DTO returned by API queries
 */
export class RecreationAssetDto extends BaseRecreationAssetDto {
  @ApiProperty({
    description: 'Unique surrogate identifier for the asset',
    example: 101,
  })
  @IsInt()
  asset_id: number;

  @ApiPropertyOptional({
    description: 'User identifier who last updated the record',
    type: String,
    nullable: true,
  })
  @IsOptional()
  updated_by?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when record was last updated',
    type: String,
    nullable: true,
  })
  @IsOptional()
  updated_at?: Date | string | null;

  @ApiProperty({
    description: 'List of repairs associated with this asset',
    type: [RecreationAssetRepairDto],
  })
  @IsArray()
  recreation_asset_repair: RecreationAssetRepairDto[];
}

// Standard Partial DTO for fields that can be updated on an asset
export class UpdateAssetFieldsDto extends PartialType(BaseRecreationAssetDto) {}

// DTO for bulk operation
export class RecreationAssetBulkUpdateDto {
  @ApiProperty({
    description: 'List of asset IDs to update',
    example: [101, 102, 103],
  })
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  asset_ids: number[];

  @ApiProperty({
    description: 'Fields to update for the specified assets',
    example: {
      asset_name: 'Updated Asset Name',
      asset_area: 50.0,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAssetFieldsDto)
  update_fields: UpdateAssetFieldsDto;
}

export class FindAllAssetsQueryDto {
  // --- Pagination ---
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsInt()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  // --- Filters ---
  @ApiPropertyOptional({ description: 'Filter by exact Parent ID' })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Filter by asset tag (contains)' })
  @IsString()
  @IsOptional()
  asset_tag?: string;

  @ApiPropertyOptional({ description: 'Filter by recreation resource ID' })
  @IsString()
  @IsOptional()
  rec_resource_id?: string;

  @ApiPropertyOptional({ description: 'Filter by asset code' })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  asset_code?: number;

  @ApiPropertyOptional({ description: 'Filter by asset name (contains)' })
  @IsString()
  @IsOptional()
  asset_name?: string;

  @ApiPropertyOptional({ description: 'Filter by legacy structure ID' })
  @IsString()
  @IsOptional()
  legacy_structure_id?: string;

  @ApiPropertyOptional({ description: 'Filter by min actual value' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  min_actual_value?: number;

  @ApiPropertyOptional({ description: 'Filter by max actual value' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  max_actual_value?: number;

  // --- Include Repairs ---
  @ApiPropertyOptional({
    description: 'Include repair records in the asset response',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  // Converts query string values ("true" / "1") into native JS boolean
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  include_repair?: boolean = false;
}

export class PaginatedRecreationAssetDto {
  @ApiProperty({ type: [RecreationAssetDto] })
  data: RecreationAssetDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

/**
 * Payload for bulk-creating multiple Recreation Assets in a single request
 */
export class BulkCreateRecreationAssetsDto {
  @ApiProperty({
    description: 'List of assets to create',
    type: [CreateRecreationAssetDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecreationAssetDto)
  @ArrayMinSize(1)
  assets: CreateRecreationAssetDto[];
}

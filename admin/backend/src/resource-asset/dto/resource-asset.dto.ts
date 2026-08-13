import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * Base DTO containing shared asset attributes
 */
export class BaseRecreationAssetDto {
  @ApiPropertyOptional({
    description: 'ID of the parent container asset',
    example: 100,
    nullable: true,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  parent_id?: number | null;

  @ApiPropertyOptional({
    description: 'Physical barcode or field tag',
    example: 'CS-012',
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
    nullable: true,
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  asset_name?: string | null;

  @ApiPropertyOptional({
    description: 'Free-text note',
    example: 'Located near river',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  asset_comment?: string | null;

  @ApiPropertyOptional({
    description: 'Legacy aggregate structure reference ID',
    example: 'LEG-884',
    nullable: true,
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  legacy_structure_id?: string | null;

  @ApiPropertyOptional({
    description: 'Total length in metres',
    example: 12.5,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_length?: number | null;

  @ApiPropertyOptional({
    description: 'Total width in metres',
    example: 3.0,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_width?: number | null;

  @ApiPropertyOptional({
    description: 'Total area in square metres',
    example: 37.5,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  asset_area?: number | null;

  @ApiPropertyOptional({
    description: 'Default monetary value',
    example: 1500.0,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  default_value?: number | null;

  @ApiPropertyOptional({
    description: 'Actual monetary value',
    example: 1800.5,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  actual_value?: number | null;

  @ApiPropertyOptional({
    description: 'Date the asset was installed (YYYY-MM-DD)',
    example: '2023-05-15',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  installation_date?: string | null;
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
      default_value: 2000.0,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAssetFieldsDto)
  update_fields: UpdateAssetFieldsDto;
}

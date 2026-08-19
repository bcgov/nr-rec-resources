import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * Base DTO containing shared repair attributes
 */
export class BaseRecreationAssetRepairDto {
  @ApiPropertyOptional({
    description:
      'Remedial repair classification code (FK to recreation_remed_repair_code)',
    example: 'RC',
    maxLength: 2,
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(2)
  @IsOptional()
  recreation_remed_repair_code?: string | null;

  @ApiPropertyOptional({
    description: 'Estimated financial cost for repair',
    example: 450.0,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  estimated_repair_cost?: number | null;

  @ApiPropertyOptional({
    description: 'Final actual cost incurred',
    example: 485.5,
    type: Number,
    nullable: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  actual_repair_cost?: number | null;

  @ApiPropertyOptional({
    description: 'Date completed (YYYY-MM-DD)',
    example: '2026-08-10',
    type: String,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  repair_completed_date?: string | null;

  @ApiPropertyOptional({
    description: 'Urgency/priority of repair',
    example: 'High',
    maxLength: 25,
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(25)
  @IsOptional()
  urgency?: string | null;

  @ApiPropertyOptional({
    description: 'Trail segment start reference',
    example: 'KM 0.5',
    maxLength: 50,
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  trail_segment_start?: string | null;

  @ApiPropertyOptional({
    description: 'Trail segment end reference',
    example: 'KM 1.2',
    maxLength: 50,
    type: String,
    nullable: true,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  trail_segment_end?: string | null;
}

/**
 * Payload for creating a new asset repair entry
 */
export class CreateRecreationAssetRepairDto extends BaseRecreationAssetRepairDto {
  @ApiPropertyOptional({
    description:
      'FK linking to the individual asset being repaired (populated automatically from URL param)',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  asset_id?: number;
}

/**
 * Payload for updating an existing repair entry
 */
export class UpdateRecreationAssetRepairDto extends PartialType(
  CreateRecreationAssetRepairDto,
) {}

/**
 * Full Read DTO returned by API queries
 */
export class RecreationAssetRepairDto extends BaseRecreationAssetRepairDto {
  @ApiProperty({
    description: 'Unique surrogate identifier for the repair log entry',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  repair_id: number;

  @ApiProperty({
    description: 'FK linking to the individual asset being repaired',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  asset_id: number;

  @ApiPropertyOptional({
    description: 'Timestamp when record was created',
    type: String,
    nullable: true,
  })
  @IsOptional()
  created_at?: Date | string | null;

  @ApiPropertyOptional({
    description: 'User identifier who created the record',
    type: String,
    nullable: true,
  })
  @IsOptional()
  created_by?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when record was last updated',
    type: String,
    nullable: true,
  })
  @IsOptional()
  updated_at?: Date | string | null;

  @ApiPropertyOptional({
    description: 'User identifier who last updated the record',
    type: String,
    nullable: true,
  })
  @IsOptional()
  updated_by?: string | null;
}

export class RepairChange {
  @ApiProperty({
    description: 'Estimated cost of the repair',
    example: 1000.0,
  })
  @IsNumber()
  @IsNotEmpty()
  estimated_repair_cost: number;

  @ApiPropertyOptional({
    description: 'Actual cost of the repair, once known',
    example: 950.0,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  actual_repair_cost?: number;

  @ApiPropertyOptional({
    description: 'Trail station where the repaired segment starts',
    example: '49.232423, -128.334343',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  station_start?: string;

  @ApiPropertyOptional({
    description: 'Trail station where the repaired segment ends',
    example: '49.234561, -128.331872',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  station_end?: string;

  @ApiProperty({
    description: 'Array of asset IDs to which this repair change applies',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  asset_ids: number[];
}

export class RecreationAssetBulkRepairDto {
  @ApiProperty({
    description:
      'Remedial repair classification code (FK to recreation_remed_repair_code)',
    example: 'CL',
  })
  @IsString()
  @IsNotEmpty()
  recreation_remed_repair_code: string;

  @ApiProperty({
    description: 'Date when the repairs were completed',
    example: '2023-10-01',
  })
  @IsDateString()
  @IsOptional()
  completed_date?: string;

  @ApiProperty({
    description: 'Array of repair changes to be applied across multiple assets',
    example: [
      {
        estimated_repair_cost: 1000.0,
        actual_repair_cost: 950.0,
        asset_ids: [1, 2, 3],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepairChange)
  changes: RepairChange[];
}

export class BulkAssetUpdateResponseDto {
  @ApiProperty({
    description: 'Status response from Bulk Update operation',
    example: 'success',
  })
  status: string;
  @ApiProperty({
    description: 'Number of updated rows',
    example: 2,
  })
  updated_count: number;
  @ApiProperty({
    description: 'List of updated assets',
    example: 'success',
  })
  updated_asset_ids: number[];
}

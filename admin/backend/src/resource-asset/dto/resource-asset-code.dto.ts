import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RecreationAssetCodeDto {
  @ApiProperty({
    description: 'Surrogate primary key for the asset type code',
    example: 1,
  })
  @IsInt()
  asset_code: number;

  @ApiPropertyOptional({
    description: 'Description of the asset type',
    example: 'Table - log',
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Indicates whether a length measurement is applicable for this asset type',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  has_length?: boolean;

  @ApiPropertyOptional({
    description:
      'Indicates whether a width measurement is applicable for this asset type',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  has_width?: boolean;

  @ApiPropertyOptional({
    description:
      'Indicates whether an area measurement is applicable for this asset type',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  has_area?: boolean;

  @ApiPropertyOptional({
    description: 'Default monetary value for an asset of this type',
    example: 300.0,
  })
  @IsNumber()
  @IsOptional()
  default_value?: number | null;
}

export class RecreationRepairCodeDto {
  @ApiProperty({
    description: 'Surrogate primary key for the remedial repair code',
    example: 'CL',
    maxLength: 2,
  })
  @IsString()
  @MaxLength(2)
  recreation_remed_repair_code: string;

  @ApiPropertyOptional({
    description: 'Description of the repair code',
    example: 'Clean',
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  description?: string;
}

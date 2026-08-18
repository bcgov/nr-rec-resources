import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

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

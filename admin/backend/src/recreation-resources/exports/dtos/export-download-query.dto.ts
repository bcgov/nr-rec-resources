import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IMPLEMENTED_EXPORT_DATASET_IDS,
  type ExportDatasetId,
} from '@/recreation-resources/exports/datasets';

export class ExportDownloadQueryDto {
  @ApiProperty({
    enum: IMPLEMENTED_EXPORT_DATASET_IDS,
    description: 'Implemented dataset identifier',
  })
  @IsIn(IMPLEMENTED_EXPORT_DATASET_IDS)
  dataset: ExportDatasetId;

  @ApiPropertyOptional({
    description: 'Optional district code filter',
    example: 'RCKY',
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({
    description: 'Optional resource type code filter',
    example: 'FAC',
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({
    description:
      'Include archived files, and child rows belonging to archived files. ' +
      'On by default; pass false to leave them out.',
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  // Archived rows ship unless the caller explicitly opts out ("false" / "0")
  @Transform(
    ({ value }) => value !== 'false' && value !== false && value !== '0',
  )
  includeArchived?: boolean = true;
}

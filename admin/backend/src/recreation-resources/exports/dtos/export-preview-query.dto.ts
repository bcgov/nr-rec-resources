import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  IMPLEMENTED_EXPORT_DATASET_IDS,
  type ExportDatasetId,
} from '@/recreation-resources/exports/datasets';

const DEFAULT_EXPORT_PREVIEW_LIMIT = 50;
const MAX_EXPORT_PREVIEW_LIMIT = 100;

export class ExportPreviewQueryDto {
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
    description: 'Preview row limit',
    default: DEFAULT_EXPORT_PREVIEW_LIMIT,
    minimum: 1,
    maximum: MAX_EXPORT_PREVIEW_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_EXPORT_PREVIEW_LIMIT)
  limit: number = DEFAULT_EXPORT_PREVIEW_LIMIT;
}

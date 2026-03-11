import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
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
}

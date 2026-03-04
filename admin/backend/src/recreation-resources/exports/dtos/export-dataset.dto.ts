import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALL_EXPORT_DATASETS } from '@/recreation-resources/exports/datasets';

export class ExportDatasetDto {
  @ApiProperty({
    description: 'Stable dataset identifier used by export endpoints',
    example: 'file-details',
    enum: ALL_EXPORT_DATASETS.map((dataset) => dataset.id),
  })
  id: string;

  @ApiProperty({
    description: 'Human-readable dataset label shown in the admin UI',
    example: 'File details',
  })
  label: string;

  @ApiProperty({
    description: 'Dataset source system for this export variant',
    example: 'RST',
    enum: ['RST', 'FTA'],
  })
  source: string;

  @ApiPropertyOptional({
    description:
      "Dataset note or sentinel value such as 'not-implemented' for unavailable datasets",
    example:
      'ROLLUP_REGION_NO, ROLLUP_REGION_CODE, and FOREST_REGION are currently blank.',
  })
  info?: string;
}

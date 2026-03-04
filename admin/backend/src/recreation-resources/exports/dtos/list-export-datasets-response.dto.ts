import { ApiProperty } from '@nestjs/swagger';
import { ExportDatasetDto } from '@/recreation-resources/exports/dtos/export-dataset.dto';

export class ListExportDatasetsResponseDto {
  @ApiProperty({
    description: 'Known export datasets and any availability notes',
    type: [ExportDatasetDto],
  })
  datasets: ExportDatasetDto[];
}

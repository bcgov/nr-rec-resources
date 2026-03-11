import { ApiProperty } from '@nestjs/swagger';
import { RecreationResourceSummaryDto } from './recreation-resource-summary.dto';

export class PaginatedRecreationResourceSummaryDto {
  @ApiProperty({
    description: 'Array of recreation resource summaries for this page',
    type: [RecreationResourceSummaryDto],
  })
  data: RecreationResourceSummaryDto[];

  @ApiProperty({
    description: 'Total number of matching recreation resources',
    example: 2500,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-indexed)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}

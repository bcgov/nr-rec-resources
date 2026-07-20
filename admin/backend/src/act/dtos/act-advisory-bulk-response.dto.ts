import { ApiProperty } from '@nestjs/swagger';
import { ActAdvisoryResponseDto } from './act-advisory-response.dto';

/**
 * Response returned by the bulk Act advisory upsert endpoint.
 */
export class ActAdvisoryBulkResponseDto {
  @ApiProperty({
    description: 'Number of advisory rows processed.',
    example: 2,
  })
  count: number;

  @ApiProperty({
    description:
      'One result per recreation resource ID that was processed during the bulk upsert.',
    type: [ActAdvisoryResponseDto],
  })
  results: ActAdvisoryResponseDto[];
}

import { ApiProperty } from '@nestjs/swagger';

/**
 * Response returned by the Act CUD endpoints describing the action that
 * was performed against `act_advisories_flat`.
 */
export class ActAdvisoryResponseDto {
  @ApiProperty({
    description:
      'Recreation resource identifier (REC ID) the advisory applies to.',
    example: 'REC0002',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Act advisory number.',
    example: 3791,
  })
  advisory_number: number;

  @ApiProperty({
    description: 'The action that was performed.',
    enum: ['created', 'updated', 'deleted'],
    example: 'created',
  })
  action: 'created' | 'updated' | 'deleted';

  @ApiProperty({
    description: 'Timestamp (ISO 8601) at which the action was performed.',
    example: '2026-06-10T18:30:00.000Z',
  })
  timestamp: string;
}

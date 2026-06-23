import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecreationResourceAdvisoryDto {
  @ApiProperty({ description: 'Advisory number', example: 12345 })
  advisory_number: number;

  @ApiProperty({ description: 'Event type', example: 'General Public Safety' })
  event_type: string;

  @ApiProperty({ description: 'Access status name', example: 'Closure' })
  access_status_name: string;

  @ApiProperty({ description: 'Advisory status', example: 'Published' })
  advisory_status: string;

  @ApiProperty({ description: 'Urgency level', example: 'High' })
  urgency: string;

  @ApiProperty({
    description: 'Advisory date (posted date)',
    type: String,
    format: 'date-time',
  })
  advisory_date: Date;

  @ApiProperty({
    description: 'Effective date (event start)',
    type: String,
    format: 'date-time',
  })
  effective_date: Date;

  @ApiPropertyOptional({
    description: 'End date (event end)',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  end_date: Date | null;

  @ApiPropertyOptional({
    description: 'Expiry date',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  expiry_date: Date | null;

  @ApiPropertyOptional({
    description: 'Last updated date',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  updated_date: Date | null;

  @ApiPropertyOptional({
    description: 'Published at date',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  published_at: Date | null;

  @ApiProperty({
    description: 'Submitted by (published by)',
    example: 'Jane Doe',
  })
  submitted_by: string;

  @ApiProperty({
    description: 'Whether to display the advisory date',
    example: true,
  })
  is_advisory_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether to display the effective date',
    example: true,
  })
  is_effective_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether to display the end date',
    example: false,
  })
  is_end_date_displayed: boolean;

  @ApiProperty({
    description: 'Whether to display the last updated date',
    example: true,
  })
  is_updated_date_displayed: boolean;
}

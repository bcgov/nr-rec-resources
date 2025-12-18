import { ApiProperty } from '@nestjs/swagger';

export class RecreationFeeDto {
  @ApiProperty({
    description: 'Unique identifier for the fee',
    example: 123,
  })
  fee_id: number;

  @ApiProperty({
    description: 'Amount charged for the recreation resource',
    example: 15,
    required: false,
  })
  fee_amount?: number;

  @ApiProperty({
    description: 'Start date for the fee applicability',
    example: '2024-06-01',
    required: false,
  })
  fee_start_date?: Date;

  @ApiProperty({
    description: 'End date for the fee applicability',
    example: '2024-09-30',
    required: false,
  })
  fee_end_date?: Date;

  @ApiProperty({
    description: 'Type of fee applicable represented by code (C, D, H, P, T)',
    example: 'C',
  })
  recreation_fee_code: string;

  @ApiProperty({
    description: 'Description of the fee type',
    example: 'Camping',
  })
  fee_type_description: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Monday',
    example: 'Y',
    required: false,
  })
  monday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Tuesday',
    example: 'Y',
    required: false,
  })
  tuesday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Wednesday',
    example: 'Y',
    required: false,
  })
  wednesday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Thursday',
    example: 'Y',
    required: false,
  })
  thursday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Friday',
    example: 'Y',
    required: false,
  })
  friday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Saturday',
    example: 'Y',
    required: false,
  })
  saturday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Sunday',
    example: 'Y',
    required: false,
  })
  sunday_ind?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

/**
 * Dates are tri-state on the wire:
 *   undefined -> field not being edited, left untouched
 *   null      -> explicitly cleared (an emptied date input)
 *   string    -> set to this date
 *
 * `@IsOptional` skips validation for both null and undefined, so an explicit
 * null passes through to the service without tripping `@IsDateString`.
 */
export class AgreementDateRangeDto {
  @ApiProperty({
    type: String,
    example: '2024-01-01',
    required: false,
    nullable: true,
    description:
      'Agreement start date in YYYY-MM-DD format. Send null to clear it.',
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsDateString()
  agreementStartDate?: string | null;

  @ApiProperty({
    type: String,
    example: '2026-12-31',
    required: false,
    nullable: true,
    description:
      'Agreement end date in YYYY-MM-DD format. Send null to clear it.',
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsDateString()
  agreementEndDate?: string | null;
}

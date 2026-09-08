import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class AgreementDateRangeDto {
  @ApiProperty({
    example: '2024-01-01',
    required: false,
    description: 'Agreement start date in YYYY-MM-DD format',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  agreementStartDate?: string;

  @ApiProperty({
    example: '2026-12-31',
    required: false,
    description: 'Agreement end date in YYYY-MM-DD format',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  agreementEndDate?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecreationFeeDto {
  @ApiProperty({
    description: 'Type of fee applicable represented by code (C, D, H, P, T)',
    example: 'C',
  })
  @IsString()
  @Matches(/^[A-Z]$/, {
    message: 'recreation_fee_code must be a single uppercase letter',
  })
  recreation_fee_code: string;

  @ApiProperty({
    description:
      'Subtype of fee represented by code (e.g., CAMPING, HUTS, DAY_USE)',
    example: 'CAMPING',
    required: false,
  })
  @IsString()
  @Matches(/^[A-Z_]{2,30}$/, {
    message:
      'recreation_fee_sub_code must be uppercase letters/underscores (2-30 chars)',
  })
  @IsOptional()
  recreation_fee_sub_code?: string;

  @ApiProperty({
    description: 'Amount charged for the recreation resource',
    example: 15.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fee_amount?: number;

  @ApiProperty({
    description: 'Start date for the fee applicability',
    example: '2024-06-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fee_start_date?: string;

  @ApiProperty({
    description: 'End date for the fee applicability',
    example: '2024-09-30',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fee_end_date?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Monday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'monday_ind must be Y or N',
  })
  @IsOptional()
  monday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Tuesday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'tuesday_ind must be Y or N',
  })
  @IsOptional()
  tuesday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Wednesday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'wednesday_ind must be Y or N',
  })
  @IsOptional()
  wednesday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Thursday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'thursday_ind must be Y or N',
  })
  @IsOptional()
  thursday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Friday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'friday_ind must be Y or N',
  })
  @IsOptional()
  friday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Saturday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'saturday_ind must be Y or N',
  })
  @IsOptional()
  saturday_ind?: string;

  @ApiProperty({
    description: 'Indicates if the fee applies on Sunday',
    example: 'N',
    required: false,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'sunday_ind must be Y or N',
  })
  @IsOptional()
  sunday_ind?: string;

  @ApiProperty({
    description: 'Whether this fee recurs yearly for the given month/day range',
    example: false,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  recurring_ind?: boolean;

  @ApiProperty({
    description:
      'Start month-day of the recurring fee period (MM-DD format, e.g. 06-01)',
    example: '06-01',
    required: false,
  })
  @IsString()
  @Matches(/^\d{2}-\d{2}$/, {
    message: 'recurring_start_mmdd must be in MM-DD format',
  })
  @IsOptional()
  recurring_start_mmdd?: string;

  @ApiProperty({
    description:
      'End month-day of the recurring fee period (MM-DD format, e.g. 08-31)',
    example: '08-31',
    required: false,
  })
  @IsString()
  @Matches(/^\d{2}-\d{2}$/, {
    message: 'recurring_end_mmdd must be in MM-DD format',
  })
  @IsOptional()
  recurring_end_mmdd?: string;
}

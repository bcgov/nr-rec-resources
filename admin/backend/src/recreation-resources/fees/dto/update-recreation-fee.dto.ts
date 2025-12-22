import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateRecreationFeeDto {
  @ApiPropertyOptional({
    description: 'Type of fee applicable represented by code (C, D, H, P, T)',
    example: 'C',
    type: String,
  })
  @IsString()
  @Matches(/^[A-Z]$/, {
    message: 'recreation_fee_code must be a single uppercase letter',
  })
  @IsOptional()
  recreation_fee_code?: string;

  @ApiPropertyOptional({
    description: 'Amount charged for the recreation resource',
    example: 15.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  fee_amount?: number;

  @ApiPropertyOptional({
    description: 'Start date for the fee applicability',
    example: '2024-06-01',
    nullable: true,
    type: String,
  })
  @IsDateString()
  @IsOptional()
  fee_start_date?: string | null;

  @ApiPropertyOptional({
    description: 'End date for the fee applicability',
    example: '2024-09-30',
    nullable: true,
    type: String,
  })
  @IsDateString()
  @IsOptional()
  fee_end_date?: string | null;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Monday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'monday_ind must be Y or N',
  })
  @IsOptional()
  monday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Tuesday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'tuesday_ind must be Y or N',
  })
  @IsOptional()
  tuesday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Wednesday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'wednesday_ind must be Y or N',
  })
  @IsOptional()
  wednesday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Thursday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'thursday_ind must be Y or N',
  })
  @IsOptional()
  thursday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Friday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'friday_ind must be Y or N',
  })
  @IsOptional()
  friday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Saturday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'saturday_ind must be Y or N',
  })
  @IsOptional()
  saturday_ind?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the fee applies on Sunday',
    example: 'N',
    type: String,
  })
  @IsString()
  @Matches(/^[YN]$/, {
    message: 'sunday_ind must be Y or N',
  })
  @IsOptional()
  sunday_ind?: string;
}

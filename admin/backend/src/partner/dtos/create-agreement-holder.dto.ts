import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { AgreementDateRangeDto } from './agreement-date-range.dto';

export class CreateAgreementHolderDto extends AgreementDateRangeDto {
  @ApiProperty({
    example: '00000002',
    description: 'Client number assigned to the recreation resource',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^\d{8}$/, {
    message: 'clientNumber must be an 8-digit client id.',
  })
  clientNumber: string;

  @ApiProperty({
    example: false,
    required: false,
    description:
      'Whether the agreement holder is visible on the public website',
  })
  @IsOptional()
  @IsBoolean()
  visible_on_public_website?: boolean;

  @ApiProperty({
    example: 'SITE_OPERATOR',
    required: false,
    description: 'Relationship type code for the agreement holder',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  partner_relationship_type_code?: string;
}

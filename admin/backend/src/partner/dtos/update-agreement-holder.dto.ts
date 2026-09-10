import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { AgreementDateRangeDto } from './agreement-date-range.dto';

export class UpdateAgreementHolderDto extends AgreementDateRangeDto {
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

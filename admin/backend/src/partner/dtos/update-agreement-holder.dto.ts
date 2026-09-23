import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
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
    example: true,
    required: false,
    description:
      'Marks the agreement as cancelled. One-way: an already-cancelled agreement cannot be un-cancelled.',
  })
  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
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
}

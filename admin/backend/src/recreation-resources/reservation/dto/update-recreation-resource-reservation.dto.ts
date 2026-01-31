import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsUrl } from 'class-validator';

/**
 * DTO used to update reservation information for a recreation resource.
 */
export class UpdateRecreationResourceReservationDto {
  @ApiProperty({
    description: 'Reservation website of designed resource',
    example: 'www.firesidecamping.ca',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUrl({ require_protocol: false })
  reservation_website?: string;
  @ApiProperty({
    description: 'Reservation phone number of designed resource',
    example: '(999)999-9999',
    required: false,
  })
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;

    // normalize to E.164 for validation
    // assumes CA/US numbers
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 ? `+1${digits}` : value;
  })
  @IsOptional()
  @IsPhoneNumber('CA')
  reservation_phone_number?: string;
  @ApiProperty({
    description: 'Reservation email of designed resource',
    example: 'reservation@email.com',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail()
  reservation_email?: string;
}

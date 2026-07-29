import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsUrl, Matches } from 'class-validator';

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
    example: '250-555-1234',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, {
    message: 'Invalid phone number format. Example: 250-555-1234.',
  })
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

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsUrl } from 'class-validator';

/**
 * DTO used to update reservation information for a recreation resource.
 */
export class UpdateRecreationResourceReservationDto {
  @ApiProperty({
    description: 'Reservation website of designed resource',
    example: 'www.firesidecamping.ca',
  })
  @IsOptional()
  @IsUrl()
  reservation_website: string;
  @ApiProperty({
    description: 'Reservation phone number of designed resource',
    example: '(999)999-9999',
  })
  @IsOptional()
  @IsPhoneNumber()
  reservation_phone_number: string;
  @ApiProperty({
    description: 'Reservation email of designed resource',
    example: 'reservation@email.com',
  })
  @IsOptional()
  @IsEmail()
  reservation_email: string;
}

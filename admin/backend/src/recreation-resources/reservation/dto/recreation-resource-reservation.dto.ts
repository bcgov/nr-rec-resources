import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO containing reservation data for a recreation resource.
 */
export class RecreationResourceReservationInfoDto {
  @ApiProperty({
    description:
      'Rec resource id for the resource this geospatial data belongs to',
    type: String,
    required: true,
    example: 'REC123',
  })
  rec_resource_id: string;
  @ApiProperty({
    description: 'Reservation website of designed resource',
    example: 'www.firesidecamping.ca',
    required: false,
  })
  reservation_website?: string;
  @ApiProperty({
    description: 'Reservation phone number of designed resource',
    example: '(999)999-9999',
    required: false,
  })
  reservation_phone_number?: string;
  @ApiProperty({
    description: 'Reservation email of designed resource',
    example: 'reservation@email.com',
    required: false,
  })
  reservation_email?: string;
}

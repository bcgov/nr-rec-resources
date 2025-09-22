import { ApiProperty } from '@nestjs/swagger';

export class AlphabeticalRecreationResourceDto {
  @ApiProperty({
    description: 'Unique identifier of the Recreation Resource',
    example: 'REC204117',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Official name of the Recreation Resource',
    example: 'Evergreen Valley Campground',
  })
  name: string;
}

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

  @ApiProperty({
    description: 'Type of the Recreation Resource',
    example: 'Site',
  })
  recreation_resource_type: string;

  @ApiProperty({
    description: 'Code representing the type of the Recreation Resource',
    example: 'SIT',
  })
  recreation_resource_type_code: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class RecreationFeatureDto {
  @ApiProperty({
    description: 'Code describing the Recreation Feature',
    example: 'A1',
  })
  recreation_feature_code: string;

  @ApiProperty({
    description: 'Description of the code value',
    example: 'Sport Fish',
  })
  description: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateFeaturesDto {
  @ApiProperty({
    description: 'Array of recreation feature codes',
    example: ['A1', 'B2', 'X0'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(3, { each: true })
  feature_codes: string[];
}

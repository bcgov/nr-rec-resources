import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

/**
 * DTO for updating recreation resource activities.
 * Contains an array of activity codes to associate with the resource.
 */
export class UpdateActivitiesDto {
  @ApiProperty({
    description: 'Array of recreation activity codes',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  activity_codes: number[];
}

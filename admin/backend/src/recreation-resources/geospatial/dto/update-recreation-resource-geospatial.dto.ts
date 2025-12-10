import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsInt, Min, Max, IsPositive } from 'class-validator';

/**
 * DTO used to update geospatial information for a recreation resource.
 * UTM fields (zone, easting, northing) are required together.
 */
export class UpdateRecreationResourceGeospatialDto {
  @ApiProperty({
    description:
      'UTM zone number for the site point (integer). Must be between 1 and 60.',
    example: 10,
    type: Number,
    required: true,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  utm_zone: number;

  @ApiProperty({
    description:
      'UTM easting value (meters) for the site point. Positive numeric value expected.',
    example: 500000,
    type: Number,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  utm_easting: number;

  @ApiProperty({
    description:
      'UTM northing value (meters) for the site point. Positive numeric value expected.',
    example: 5450000,
    type: Number,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  utm_northing: number;
}

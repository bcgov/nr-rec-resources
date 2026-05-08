import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TrailType } from './recreation-trail.dto';

export class CreateTrailDto {
  @ApiProperty({
    description: 'Recreation activity code this trail belongs to',
    example: 34,
  })
  @IsInt()
  recreation_activity_code: number;

  @ApiProperty({
    description: 'Difficulty classification of the trail',
    enum: TrailType,
    example: TrailType.BLUE,
  })
  @IsEnum(TrailType)
  trail_type: TrailType;

  @ApiProperty({
    description: 'Name of the trail',
    example: 'Talladega Knight',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    description: 'Description of the trail',
    example: 'An accessible mountain bike trail suitable for all riders.',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

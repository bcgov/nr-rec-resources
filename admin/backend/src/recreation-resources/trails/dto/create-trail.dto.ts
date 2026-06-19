import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    description: 'Difficulty classification of the trail',
    enum: TrailType,
    example: TrailType.BLUE,
    nullable: true,
  })
  @IsEnum(TrailType)
  @IsOptional()
  trail_type?: TrailType | null;

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

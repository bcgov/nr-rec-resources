import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TrailType } from './recreation-trail.dto';

export class UpdateTrailDto {
  @ApiPropertyOptional({
    description: 'Difficulty classification of the trail',
    enum: TrailType,
    example: TrailType.BLUE,
    nullable: true,
  })
  @IsEnum(TrailType)
  @IsOptional()
  trail_type?: TrailType | null;

  @ApiPropertyOptional({
    description: 'Name of the trail',
    example: 'Talladega Knight',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the trail',
    example: 'An accessible mountain bike trail suitable for all riders.',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string | null;
}

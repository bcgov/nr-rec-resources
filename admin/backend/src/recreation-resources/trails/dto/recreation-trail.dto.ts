import { ApiProperty } from '@nestjs/swagger';

export enum TrailType {
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  BLACK = 'BLACK',
}

export class RecreationTrailDto {
  @ApiProperty({
    description: 'Unique identifier for the trail',
    example: 1,
  })
  recreation_activity_code_trails_id: number;

  @ApiProperty({
    description: 'Recreation activity code this trail belongs to',
    example: 34,
  })
  recreation_activity_code: number;

  @ApiProperty({
    description: 'Difficulty classification of the trail',
    enum: TrailType,
    example: TrailType.BLUE,
  })
  trail_type: TrailType;

  @ApiProperty({
    description: 'Name of the trail',
    example: 'Talladega Knight',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the trail',
    type: String,
    example: 'An accessible mountain bike trail suitable for all riders.',
    required: false,
    nullable: true,
  })
  description?: string | null;
}

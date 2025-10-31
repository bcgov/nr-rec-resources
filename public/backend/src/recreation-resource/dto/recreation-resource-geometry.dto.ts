import { ApiProperty } from '@nestjs/swagger';

export class RecreationResourceGeometry {
  @ApiProperty({
    description: 'Unique identifier of the Recreation Resource',
    example: 'rec-123-abc',
    format: 'uuid',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Detailed description of the Recreation Resource',
    example: 'A scenic campground nestled in the heart of Evergreen Valley',
  })
  description?: string;

  @ApiProperty({
    description: 'GeoJSON geometry data for the rec resource in string format',
    type: [String],
    required: false,
    example: [
      '{"type":"MultiPolygon","coordinates":[[[[1361161.693,527454.011],[1361142.12,527451.215],[1361124.878,527449.351],[1361107.636,527447.021],[1361091.326,527449.351],[1361073.152,527452.613], ...]]]}',
    ],
  })
  spatial_feature_geometry?: string[];

  @ApiProperty({
    description:
      'GeoJSON geometry data for the point location for the rec resource in string format',
    type: String,
    required: false,
    example: ['{"type":"Point","coordinates":[1292239.7691,1133870.4011]}'],
  })
  site_point_geometry?: string;
}

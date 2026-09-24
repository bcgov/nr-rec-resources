import { ApiProperty } from '@nestjs/swagger';

export class PendingMapFeatureRequestRowDto {
  @ApiProperty({
    description: 'Recreation resource identifier for the request',
    example: 'REC270156',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Resource name when available',
    example: 'Tamihi East Campground',
    nullable: true,
    required: false,
    type: String,
  })
  name?: string | null;

  @ApiProperty({
    description: 'Recreation district description when available',
    example: 'Chilliwack Natural Resource District',
    nullable: true,
    required: false,
    type: String,
  })
  district_description?: string | null;

  @ApiProperty({
    description: 'Recreation district description when available',
    example: 'Chilliwack Natural Resource District',
    nullable: true,
    required: false,
    type: String,
  })
  recreation_district?: string | null;

  @ApiProperty({
    description: 'Natural resource district name when available',
    example: 'Chilliwack Natural Resource District',
    nullable: true,
    required: false,
    type: String,
  })
  natural_resource_district?: string | null;

  @ApiProperty({
    description: 'Recreation resource type description(s) when available',
    example: 'Recreation Site',
    nullable: true,
    required: false,
    type: String,
  })
  recreation_type?: string | null;

  @ApiProperty({
    description: 'Request amend status code',
    example: 'PND',
  })
  amend_status_code: string;

  @ApiProperty({
    description: 'Number of map feature rows included in the request',
    example: 3,
  })
  feature_count: number;

  @ApiProperty({
    description: 'Latest request creation timestamp in ISO-8601 format',
    example: '2026-09-23T21:27:08.826Z',
    nullable: true,
    required: false,
    type: String,
  })
  requested_at?: string | null;

  @ApiProperty({
    description: 'Distinct geometry types included in the request',
    example: ['Polygon', 'LineString'],
    type: [String],
  })
  geometry_types: string[];
}

export class PendingMapFeatureRequestsResponseDto {
  @ApiProperty({
    description: 'Pending request rows',
    type: [PendingMapFeatureRequestRowDto],
  })
  data: PendingMapFeatureRequestRowDto[];

  @ApiProperty({
    description: 'Total pending requests',
    example: 12,
  })
  total: number;
}

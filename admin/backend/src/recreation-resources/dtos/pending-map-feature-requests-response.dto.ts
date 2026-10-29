import { ApiProperty } from '@nestjs/swagger';

export class PendingMapFeatureRequestRowDto {
  @ApiProperty({
    description: 'Spatial submission identifier',
    example: '11234',
    nullable: true,
    required: false,
    type: String,
  })
  submission_id?: string | null;

  @ApiProperty({
    description: 'Spatial submission application GUID',
    example: '6fb3564c-9a6e-4ef0-9cc0-8e040ed5f190',
    nullable: true,
    required: false,
    type: String,
  })
  application_guid?: string | null;

  @ApiProperty({
    description:
      'SNCSC status request GUID for deep linking to submission status',
    example: '8f4d2684-8a11-4a3a-ad3c-ec4a6f4fb3f5',
    nullable: true,
    required: false,
    type: String,
  })
  status_request_guid?: string | null;

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
    description: 'Submission purpose code from recreation_spatial_submission',
    example: 'N',
    nullable: true,
    required: false,
    type: String,
  })
  purpose_code?: string | null;

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

  @ApiProperty({
    description: 'Exhibit A URL for the submission when available',
    example: 'https://example.com/exhibit-a.pdf',
    nullable: true,
    required: false,
    type: String,
  })
  exhibit_a_url?: string | null;

  @ApiProperty({
    description:
      'Backend endpoint that returns the adjudication report PDF when available',
    example:
      '/api/recreation-resources/pending-requests/6fb3564c-9a6e-4ef0-9cc0-8e040ed5f190/adjudication-report',
    nullable: true,
    required: false,
    type: String,
  })
  adjudication_report?: string | null;
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

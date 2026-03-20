import { ApiProperty } from '@nestjs/swagger';

export class AdminSearchResultRowDto {
  @ApiProperty({
    description: 'Recreation resource identifier',
    example: 'REC204118',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Recreation resource name',
    example: 'Tamihi East Campground',
  })
  name: string;

  @ApiProperty({
    description: 'Recreation resource type description',
    example: 'Campground',
  })
  recreation_resource_type: string;

  @ApiProperty({
    description: 'Recreation resource type code',
    example: 'SIT',
  })
  recreation_resource_type_code: string;

  @ApiProperty({
    description: 'District description',
    example: 'Chilliwack Natural Resource District',
  })
  district_description: string;

  @ApiProperty({
    description: 'Whether the resource is displayed on the public site',
    example: true,
  })
  display_on_public_site: boolean;

  @ApiProperty({
    description: 'Closest community',
    example: 'Hope',
  })
  closest_community: string;

  @ApiProperty({
    description: 'Recreation status description',
    example: 'Open',
  })
  status: string;

  @ApiProperty({
    description: 'Recreation status code',
    example: 1,
  })
  status_code: number;

  @ApiProperty({
    description: 'Access types associated with the resource',
    type: [String],
    example: ['Road', '4WD'],
  })
  access_types: string[];

  @ApiProperty({
    description: 'Activities associated with the resource',
    type: [String],
    example: ['Hiking', 'Fishing'],
  })
  activities: string[];

  @ApiProperty({
    description: 'Derived fee indicators associated with the resource',
    type: [String],
    example: ['Reservable', 'Has fees'],
  })
  fee_indicators: string[];

  @ApiProperty({
    description: 'Project established date',
    example: '2021-05-12',
    required: false,
    nullable: true,
    type: String,
  })
  established_date?: string | null;

  @ApiProperty({
    description: 'Number of campsites',
    example: 24,
  })
  campsite_count: number;
}

export class AdminSearchResponseDto {
  @ApiProperty({
    description: 'Search result rows',
    type: [AdminSearchResultRowDto],
  })
  data: AdminSearchResultRowDto[];

  @ApiProperty({
    description: 'Total number of matching resources',
    example: 137,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size used for the response',
    example: 25,
  })
  page_size: number;
}

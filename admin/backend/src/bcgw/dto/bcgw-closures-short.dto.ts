import { ApiProperty } from '@nestjs/swagger';
import { BcgwPaginationMetaDto } from './bcgw-recreation-resource.dto';

export class BcgwClosuresShortDto {
  @ApiProperty({ example: 'REC204117' })
  forest_file_id: string;

  @ApiProperty({ type: String, nullable: true })
  project_name: string | null;

  @ApiProperty({
    type: String,
    example: 'SIT - Recreation Site',
    nullable: true,
  })
  project_type: string | null;

  @ApiProperty({ enum: ['Y', 'N'], example: 'N' })
  closure_ind: string;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  closure_date: Date | null;

  @ApiProperty({ type: String, example: 'Wildfire', nullable: true })
  closure_type: string | null;

  @ApiProperty({ type: String, example: 'PEMBERTON', nullable: true })
  site_location: string | null;

  @ApiProperty({ example: 0 })
  defined_campsites: number;

  @ApiProperty({ type: String, example: 'RDPG', nullable: true })
  recreation_district_code: string | null;

  @ApiProperty({
    type: String,
    example: 'Prince George-Mackenzie',
    nullable: true,
  })
  recreation_district_name: string | null;

  @ApiProperty({ type: String, nullable: true })
  org_unit_name: string | null;

  @ApiProperty({ type: String, nullable: true })
  closure_comment: string | null;

  @ApiProperty({ type: String, nullable: true })
  site_description: string | null;

  @ApiProperty({ type: String, nullable: true })
  driving_directions: string | null;

  @ApiProperty({
    type: Number,
    description: 'Latitude in decimal degrees (WGS84)',
    example: 55.3237,
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    type: Number,
    description: 'Longitude in decimal degrees (WGS84)',
    example: -123.0935,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    type: String,
    description: 'GeoJSON Point geometry (WGS84)',
    example: '{"type":"Point","coordinates":[-123.0935,55.3237]}',
    nullable: true,
  })
  shape: string | null;
}

export class BcgwClosuresShortFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type: 'Feature';

  @ApiProperty({
    description:
      'GeoJSON Point geometry (WGS84), null when no site point exists',
    nullable: true,
    example: { type: 'Point', coordinates: [-123.0935, 55.3237] },
  })
  geometry: object | null;

  @ApiProperty({ type: () => BcgwClosuresShortDto })
  properties: BcgwClosuresShortDto;
}

export class BcgwClosuresShortFeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: 'FeatureCollection';

  @ApiProperty({
    description: 'Array of GeoJSON Feature objects',
    isArray: true,
    type: () => BcgwClosuresShortFeatureDto,
  })
  features: BcgwClosuresShortFeatureDto[];

  @ApiProperty({ type: () => BcgwPaginationMetaDto })
  meta: BcgwPaginationMetaDto;
}

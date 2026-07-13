import { ApiProperty } from '@nestjs/swagger';

export class BcgwRecreationResourceDto {
  @ApiProperty({ example: 'REC204117' })
  forest_file_id: string;

  @ApiProperty({ nullable: true })
  project_name: string | null;

  @ApiProperty({ example: 'SIT - Recreation site', nullable: true })
  project_type_code: string | null;

  @ApiProperty({ example: 'SIT', nullable: true })
  project_type: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  project_established_date: Date | null;

  @ApiProperty({ enum: ['Y', 'N'], example: 'N' })
  closure_ind: string;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  closure_date: Date | null;

  @ApiProperty({ example: 'Wildfire', nullable: true })
  closure_type: string | null;

  @ApiProperty({ nullable: true })
  closure_comment: string | null;

  @ApiProperty({ enum: ['Y', 'N'] })
  recreation_view_ind: string;

  @ApiProperty({ example: 'HI', nullable: true })
  file_status_st: string | null;

  @ApiProperty({ example: 'HI - Issued', nullable: true })
  status_description: string | null;

  @ApiProperty({ example: 'PEMBERTON', nullable: true })
  site_location: string | null;

  @ApiProperty({ example: 0 })
  defined_campsites: number;

  @ApiProperty({ nullable: true })
  site_description_brief: string | null;

  @ApiProperty({ enum: ['Y', 'N'], nullable: true })
  arch_impact_assess_ind: string | null;

  @ApiProperty({ description: 'Total area in hectares', nullable: true })
  tenure_app_total_area: number | null;

  @ApiProperty({ description: 'Total length in kilometres', nullable: true })
  tenure_app_total_length: number | null;

  @ApiProperty({ nullable: true })
  site_description: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  site_description_date: Date | null;

  @ApiProperty({ nullable: true })
  driving_directions: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  driving_directions_date: Date | null;

  @ApiProperty({ example: 'B2', nullable: true })
  rec_feature_code: string | null;

  @ApiProperty({ example: 'B2 - Sand Beach', nullable: true })
  rec_feature_description: string | null;

  @ApiProperty({ example: 'RDPG', nullable: true })
  recreation_district_code: string | null;

  @ApiProperty({ example: 'Prince George-Mackenzie', nullable: true })
  recreation_district_name: string | null;

  @ApiProperty({ example: 'DPG', nullable: true })
  org_unit_code: string | null;

  @ApiProperty({ nullable: true })
  org_unit_name: string | null;

  @ApiProperty({ example: 10, nullable: true })
  utm_zone: number | null;

  @ApiProperty({ description: 'UTM easting in metres', nullable: true })
  utm_easting: number | null;

  @ApiProperty({ description: 'UTM northing in metres', nullable: true })
  utm_northing: number | null;

  @ApiProperty({
    description: 'Latitude in decimal degrees (WGS84)',
    example: 55.3237,
    nullable: true,
  })
  latitude: number | null;

  @ApiProperty({
    description: 'Longitude in decimal degrees (WGS84)',
    example: -123.0935,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'GeoJSON Point geometry (WGS84)',
    example: '{"type":"Point","coordinates":[-123.0935,55.3237]}',
    nullable: true,
  })
  shape: string | null;
}

export class BcgwPaginationMetaDto {
  @ApiProperty({ example: 2500 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: 1000 })
  pageSize: number;
}

export class BcgwFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type: 'Feature';

  @ApiProperty({
    description:
      'GeoJSON Point geometry (WGS84), null when no site point exists',
    nullable: true,
    example: { type: 'Point', coordinates: [-123.0935, 55.3237] },
  })
  geometry: object | null;

  @ApiProperty({ type: () => BcgwRecreationResourceDto })
  properties: BcgwRecreationResourceDto;
}

export class BcgwFeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: 'FeatureCollection';

  @ApiProperty({
    description: 'Array of GeoJSON Feature objects',
    isArray: true,
    type: () => BcgwFeatureDto,
  })
  features: BcgwFeatureDto[];

  @ApiProperty({ type: () => BcgwPaginationMetaDto })
  meta: BcgwPaginationMetaDto;
}

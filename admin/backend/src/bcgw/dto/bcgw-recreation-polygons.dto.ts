import { ApiProperty } from '@nestjs/swagger';
import { BcgwRecreationFeatureBaseDto } from './bcgw-recreation-feature-base.dto';
import { BcgwPaginationMetaDto } from './bcgw-recreation-resource.dto';

export class BcgwRecreationPolygonsDto extends BcgwRecreationFeatureBaseDto {
  @ApiProperty({
    description: 'The unique identifier (SKEY) for the Recreation Map Feature.',
    example: 23456,
  })
  rmf_skey: number;

  @ApiProperty({
    description:
      'An identifier assigned to the recreation file, e.g., REC230971.',
    example: 'REC230971',
  })
  forest_file_id: string;

  @ApiProperty({
    type: String,
    description:
      'An identifier assigned to a section of a recreation feature. Not used for polygon features.',
    example: null,
    nullable: true,
  })
  section_id: string | null;

  @ApiProperty({
    type: String,
    description:
      'Code that identifies the type of recreation feature, e.g., IF (interpretive forest), RR (recreation reserve), SIT (recreation site).',
    example: 'SIT',
    nullable: true,
  })
  recreation_map_feature_code: string | null;

  @ApiProperty({
    type: String,
    description:
      'Description of the type of recreation feature, e.g., Interpretative Forest, Recreation Reserve.',
    example: 'Recreation Site',
    nullable: true,
  })
  project_type: string | null;

  @ApiProperty({
    type: Number,
    description:
      'The number of times a feature has been amended over its lifetime.',
    example: 1,
    nullable: true,
  })
  amendment_id: number | null;

  @ApiProperty({
    type: String,
    description:
      'The default label used when displaying the feature on a map, consisting of the FOREST FILE ID only, e.g., REC230971.',
    example: 'REC230971',
    nullable: true,
  })
  map_label: string | null;

  @ApiProperty({
    type: String,
    description:
      'The name of the recreation project, e.g., KASLO INTERPRETIVE FOREST.',
    example: 'KASLO INTERPRETIVE FOREST',
    nullable: true,
  })
  project_name: string | null;

  @ApiProperty({
    type: String,
    description:
      'Code describing the type of natural or man-made recreation feature, e.g., E5 (mixed forest), H3 (historic site).',
    example: 'E5',
    nullable: true,
  })
  recreation_feature_code: string | null;

  @ApiProperty({
    type: String,
    description:
      'The closest town or city to the recreation feature, e.g., KELOWNA, BELLA COOLA.',
    example: 'KASLO',
    nullable: true,
  })
  site_location: string | null;

  @ApiProperty({
    type: String,
    description:
      'A comma-separated list of codes relating to the recreation districts that the feature is within, e.g., RDCC,RDCS.',
    example: 'RDCC',
    nullable: true,
  })
  recreation_district_code: string | null;

  @ApiProperty({
    type: String,
    description:
      'The code of the natural resource district associated with this feature.',
    example: 'DCC',
    nullable: true,
  })
  geographic_district_code: string | null;

  @ApiProperty({
    type: String,
    description:
      'The name of the natural resource district associated with this feature.',
    example: 'Chilliwack Natural Resource District',
    nullable: true,
  })
  geographic_district_name: string | null;

  @ApiProperty({
    type: Number,
    description:
      'Spatial feature area in hectares. Calculated in the source system.',
    example: 2.9634,
    nullable: true,
  })
  feature_area: number | null;

  @ApiProperty({
    type: Number,
    description:
      'Spatial perimeter length in kilometres. Calculated in the source system.',
    example: 1.0079,
    nullable: true,
  })
  feature_perimeter: number | null;

  @ApiProperty({
    type: String,
    description:
      'The system-calculated area of the polygon in square metres (returned as a string, matching BCGW VARCHAR2 type).',
    example: '29634.357175518',
    nullable: true,
  })
  feature_area_sqm: string | null;

  @ApiProperty({
    type: Number,
    description: 'The system-calculated perimeter of the polygon in metres.',
    example: 1007.9,
    nullable: true,
  })
  feature_length_m: number | null;
}

export class BcgwRecreationPolygonsFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type: 'Feature';

  @ApiProperty({
    description:
      'GeoJSON Polygon geometry (WGS84), null when no geometry exists.',
    nullable: true,
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-121.9, 49.6],
          [-121.85, 49.6],
          [-121.85, 49.65],
          [-121.9, 49.65],
          [-121.9, 49.6],
        ],
      ],
    },
  })
  geometry: object | null;

  @ApiProperty({ type: () => BcgwRecreationPolygonsDto })
  properties: BcgwRecreationPolygonsDto;
}

export class BcgwRecreationPolygonsFeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: 'FeatureCollection';

  @ApiProperty({
    description: 'Array of GeoJSON Feature objects',
    isArray: true,
    type: () => BcgwRecreationPolygonsFeatureDto,
  })
  features: BcgwRecreationPolygonsFeatureDto[];

  @ApiProperty({ type: () => BcgwPaginationMetaDto })
  meta: BcgwPaginationMetaDto;
}

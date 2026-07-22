import { ApiProperty } from '@nestjs/swagger';
import { BcgwRecreationFeatureBaseDto } from './bcgw-recreation-feature-base.dto';
import { BcgwPaginationMetaDto } from './bcgw-recreation-resource.dto';

export class BcgwRecreationLinesDto extends BcgwRecreationFeatureBaseDto {
  @ApiProperty({
    description: 'The unique identifier (SKEY) for the Recreation Map Feature.',
    example: 12345,
  })
  rmf_skey: number;

  @ApiProperty({
    description:
      'An identifier assigned to the recreation file, e.g., REC16098.',
    example: 'REC16098',
  })
  forest_file_id: string;

  @ApiProperty({
    description:
      'An identifier assigned to a section of a recreation trail, e.g., 1, 10, A, B, EATON LAKE.',
    example: '1',
    nullable: true,
  })
  section_id: string | null;

  @ApiProperty({
    description:
      'Code that identifies the type of recreation feature, e.g., IF, RTR.',
    example: 'RTR',
    nullable: true,
  })
  recreation_map_feature_code: string | null;

  @ApiProperty({
    description:
      'Description of the type of recreation feature, e.g., Interpretative Forest, Recreation Trail.',
    example: 'Recreation Trail',
    nullable: true,
  })
  project_type: string | null;

  @ApiProperty({
    description:
      'The number of times a feature has been amended over its lifetime.',
    example: 2,
    nullable: true,
  })
  amendment_id: number | null;

  @ApiProperty({
    description:
      'The default label used when displaying the feature on a map, consisting of the FOREST FILE ID and SECTION ID separated by a space.',
    example: 'REC4531 15',
    nullable: true,
  })
  map_label: string | null;

  @ApiProperty({
    description:
      'The name of the area or trail network, usually a geographic name, e.g., OKEOVER TRAILS.',
    example: 'OKEOVER TRAILS',
    nullable: true,
  })
  project_name: string | null;

  @ApiProperty({
    description:
      'Code describing the type of natural or man-made recreation feature, e.g., H3 (Historic Route).',
    example: 'H3',
    nullable: true,
  })
  recreation_feature_code: string | null;

  @ApiProperty({
    description: 'The entire width of the Right of Way for the linear feature.',
    example: 10,
    nullable: true,
  })
  right_of_way: number | null;

  @ApiProperty({
    description:
      'The closest town or city to the recreation feature, e.g., KELOWNA, BELLA COOLA.',
    example: 'KELOWNA',
    nullable: true,
  })
  site_location: string | null;

  @ApiProperty({
    description:
      'A comma-separated list of codes relating to the recreation districts that the feature is within, e.g., RDCO,RDKB,RDOS.',
    example: 'RDCO',
    nullable: true,
  })
  recreation_district_code: string | null;

  @ApiProperty({
    description:
      'The code of the natural resource district associated with this feature.',
    example: 'DCC',
    nullable: true,
  })
  district_code: string | null;

  @ApiProperty({
    description:
      'The code of the natural resource district associated with this feature (VARCHAR2(6) in BCGW; holds the district code, not the full name).',
    example: 'DCC',
    nullable: true,
  })
  district_name: string | null;

  @ApiProperty({
    description:
      'Spatial length in kilometres. Calculated in the source system.',
    example: 0.3338,
    nullable: true,
  })
  feature_length: number | null;

  @ApiProperty({
    description: 'System-calculated length of the geometry in metres.',
    example: 333.8,
    nullable: true,
  })
  feature_length_m: number | null;
}

export class BcgwRecreationLinesFeatureDto {
  @ApiProperty({ example: 'Feature' })
  type: 'Feature';

  @ApiProperty({
    description:
      'GeoJSON LineString geometry (WGS84), null when no geometry exists.',
    nullable: true,
    example: {
      type: 'LineString',
      coordinates: [
        [-123.0935, 55.3237],
        [-123.1, 55.33],
      ],
    },
  })
  geometry: object | null;

  @ApiProperty({ type: () => BcgwRecreationLinesDto })
  properties: BcgwRecreationLinesDto;
}

export class BcgwRecreationLinesFeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: 'FeatureCollection';

  @ApiProperty({
    description: 'Array of GeoJSON Feature objects',
    isArray: true,
    type: () => BcgwRecreationLinesFeatureDto,
  })
  features: BcgwRecreationLinesFeatureDto[];

  @ApiProperty({ type: () => BcgwPaginationMetaDto })
  meta: BcgwPaginationMetaDto;
}

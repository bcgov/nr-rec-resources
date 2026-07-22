import { ApiProperty } from '@nestjs/swagger';
import { BcgwRecreationFeatureBaseDto } from './bcgw-recreation-feature-base.dto';
import {
  nullableNumberProperty,
  nullableStringProperty,
} from './bcgw-nullable-property.helpers';
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

  @ApiProperty(
    nullableStringProperty(
      'An identifier assigned to a section of a recreation trail, e.g., 1, 10, A, B, EATON LAKE.',
      '1',
    ),
  )
  section_id: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Code that identifies the type of recreation feature, e.g., IF, RTR.',
      'RTR',
    ),
  )
  recreation_map_feature_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Description of the type of recreation feature, e.g., Interpretative Forest, Recreation Trail.',
      'Recreation Trail',
    ),
  )
  project_type: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The default label used when displaying the feature on a map, consisting of the FOREST FILE ID and SECTION ID separated by a space.',
      'REC4531 15',
    ),
  )
  map_label: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The name of the area or trail network, usually a geographic name, e.g., OKEOVER TRAILS.',
      'OKEOVER TRAILS',
    ),
  )
  project_name: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Code describing the type of natural or man-made recreation feature, e.g., H3 (Historic Route).',
      'H3',
    ),
  )
  recreation_feature_code: string | null;

  @ApiProperty(
    nullableNumberProperty(
      'The entire width of the Right of Way for the linear feature.',
      10,
    ),
  )
  right_of_way: number | null;

  @ApiProperty(
    nullableStringProperty(
      'A comma-separated list of codes relating to the recreation districts that the feature is within, e.g., RDCO,RDKB,RDOS.',
      'RDCO',
    ),
  )
  recreation_district_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The code of the natural resource district associated with this feature.',
      'DCC',
    ),
  )
  district_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The code of the natural resource district associated with this feature (VARCHAR2(6) in BCGW; holds the district code, not the full name).',
      'DCC',
    ),
  )
  district_name: string | null;

  @ApiProperty(
    nullableNumberProperty(
      'Spatial length in kilometres. Calculated in the source system.',
      0.3338,
    ),
  )
  feature_length: number | null;

  @ApiProperty(
    nullableNumberProperty(
      'System-calculated length of the geometry in metres.',
      333.8,
    ),
  )
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

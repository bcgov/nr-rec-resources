import { ApiProperty } from '@nestjs/swagger';
import { BcgwRecreationFeatureBaseDto } from './bcgw-recreation-feature-base.dto';
import {
  nullableNumberProperty,
  nullableStringProperty,
} from './bcgw-nullable-property.helpers';
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

  @ApiProperty(
    nullableStringProperty(
      'An identifier assigned to a section of a recreation feature. Not used for polygon features.',
      null,
    ),
  )
  section_id: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Code that identifies the type of recreation feature, e.g., IF (interpretive forest), RR (recreation reserve), SIT (recreation site).',
      'SIT',
    ),
  )
  recreation_map_feature_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Description of the type of recreation feature, e.g., Interpretative Forest, Recreation Reserve.',
      'Recreation Site',
    ),
  )
  project_type: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The default label used when displaying the feature on a map, consisting of the FOREST FILE ID only, e.g., REC230971.',
      'REC230971',
    ),
  )
  map_label: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The name of the recreation project, e.g., KASLO INTERPRETIVE FOREST.',
      'KASLO INTERPRETIVE FOREST',
    ),
  )
  project_name: string | null;

  @ApiProperty(
    nullableStringProperty(
      'Code describing the type of natural or man-made recreation feature, e.g., E5 (mixed forest), H3 (historic site).',
      'E5',
    ),
  )
  recreation_feature_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'A comma-separated list of codes relating to the recreation districts that the feature is within, e.g., RDCC,RDCS.',
      'RDCC',
    ),
  )
  recreation_district_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The code of the natural resource district associated with this feature.',
      'DCC',
    ),
  )
  geographic_district_code: string | null;

  @ApiProperty(
    nullableStringProperty(
      'The name of the natural resource district associated with this feature.',
      'Chilliwack Natural Resource District',
    ),
  )
  geographic_district_name: string | null;

  @ApiProperty(
    nullableNumberProperty(
      'Spatial feature area in hectares. Calculated in the source system.',
      2.9634,
    ),
  )
  feature_area: number | null;

  @ApiProperty(
    nullableNumberProperty(
      'Spatial perimeter length in kilometres. Calculated in the source system.',
      1.0079,
    ),
  )
  feature_perimeter: number | null;

  @ApiProperty(
    nullableStringProperty(
      'The system-calculated area of the polygon in square metres (returned as a string, matching BCGW VARCHAR2 type).',
      '29634.357175518',
    ),
  )
  feature_area_sqm: string | null;

  @ApiProperty(
    nullableNumberProperty(
      'The system-calculated perimeter of the polygon in metres.',
      1007.9,
    ),
  )
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

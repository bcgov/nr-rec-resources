import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO containing geospatial data for a recreation resource.
 * Includes spatial feature geometries and calculated coordinate values
 * derived from the recreation site point geometry.
 */
export class RecreationResourceGeospatialDto {
  @ApiProperty({
    description:
      'Rec resource id for the resource this geospatial data belongs to',
    type: String,
    required: true,
    example: 'REC123',
  })
  rec_resource_id: string;

  @ApiProperty({
    description:
      'Array of GeoJSON geometry strings representing spatial features (polygons, lines) for the recreation resource',
    type: [String],
    required: false,
    example: [
      '{"type":"Polygon","coordinates":[[[1361161.693,527454.011],[1361142.12,527451.215]...]]}',
    ],
  })
  spatial_feature_geometry?: string[];

  @ApiProperty({
    description:
      'Total length in km: perimeter for polygon/multi-polygon features plus length for linear features.',
    type: Number,
    required: false,
    example: 2.5,
    nullable: true,
  })
  total_length_km?: number | null;

  @ApiProperty({
    description:
      'Total area in hectares: polygon area plus trail area (length × right_of_way) when applicable.',
    type: Number,
    required: false,
    example: 12.35,
    nullable: true,
  })
  total_area_hectares?: number | null;

  @ApiProperty({
    description: 'Right-of-way width in metres (from recreation resource).',
    type: Number,
    required: false,
    example: 6,
    nullable: true,
  })
  right_of_way_m?: number | null;

  @ApiProperty({
    description:
      'GeoJSON geometry string representing the point location of the recreation site',
    type: String,
    required: false,
    example: '{"type":"Point","coordinates":[1292239.7691,1133870.4011]}',
  })
  site_point_geometry?: string;

  @ApiProperty({
    description:
      'UTM (Universal Transverse Mercator) zone number for the site location',
    type: Number,
    required: false,
    example: 10,
    nullable: true,
  })
  utm_zone?: number | null;

  @ApiProperty({
    description:
      'UTM easting coordinate (meters east of the UTM zone central meridian)',
    type: Number,
    required: false,
    example: 532726.45,
    nullable: true,
  })
  utm_easting?: number | null;

  @ApiProperty({
    description:
      'UTM northing coordinate (meters north of the equator in northern hemisphere)',
    type: Number,
    required: false,
    example: 5935820.12,
    nullable: true,
  })
  utm_northing?: number | null;

  @ApiProperty({
    description:
      'Latitude in decimal degrees (WGS84 coordinate system, EPSG:4326)',
    type: Number,
    required: false,
    example: 53.5461,
    nullable: true,
  })
  latitude?: number | null;

  @ApiProperty({
    description:
      'Longitude in decimal degrees (WGS84 coordinate system, EPSG:4326)',
    type: Number,
    required: false,
    example: -127.6891,
    nullable: true,
  })
  longitude?: number | null;
}

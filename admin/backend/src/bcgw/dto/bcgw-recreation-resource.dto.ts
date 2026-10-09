import { ApiProperty } from '@nestjs/swagger';
import { BcgwClosuresShortDto } from './bcgw-closures-short.dto';
import {
  BcgwFeatureBaseDto,
  BcgwFeatureCollectionBaseDto,
} from './bcgw-paginated-features.dto';

/**
 * Properties of the fully attributed closures layer.
 *
 * Extends the short closures layer, which is a strict subset of this one - the
 * fields below are what the fully attributed layer adds on top.
 */
export class BcgwRecreationResourceDto extends BcgwClosuresShortDto {
  @ApiProperty({ type: String, example: 'SIT', nullable: true })
  rec_resource_type_code: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  project_established_date: Date | null;

  @ApiProperty({ enum: ['Y', 'N'] })
  display_on_public_site_ind: string;

  @ApiProperty({ type: String, example: 'HI', nullable: true })
  rec_status_code: string | null;

  @ApiProperty({ type: String, example: 'HI - Issued', nullable: true })
  rec_status_description: string | null;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ enum: ['Y', 'N'], nullable: true })
  arch_impact_assess_ind: string | null;

  @ApiProperty({
    type: Number,
    description: 'Total area in hectares',
    nullable: true,
  })
  total_feature_area: number | null;

  @ApiProperty({
    type: Number,
    description: 'Total length in kilometres',
    nullable: true,
  })
  total_feature_length: number | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  site_description_date: Date | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  driving_directions_date: Date | null;

  @ApiProperty({ type: String, example: 'B2', nullable: true })
  recreation_feature_code: string | null;

  @ApiProperty({ type: String, example: 'B2 - Sand Beach', nullable: true })
  recreation_feature_description: string | null;

  @ApiProperty({ type: String, example: 'DPG', nullable: true })
  org_unit_code: string | null;

  @ApiProperty({ type: Number, example: 10, nullable: true })
  utm_zone: number | null;

  @ApiProperty({
    type: Number,
    description: 'UTM easting in metres',
    nullable: true,
  })
  utm_easting: number | null;

  @ApiProperty({
    type: Number,
    description: 'UTM northing in metres',
    nullable: true,
  })
  utm_northing: number | null;
}

export class BcgwFeatureDto extends BcgwFeatureBaseDto {
  @ApiProperty({
    description:
      'GeoJSON Point geometry (WGS84), null when no site point exists.',
    nullable: true,
    example: { type: 'Point', coordinates: [-123.0935, 55.3237] },
  })
  geometry: object | null;

  @ApiProperty({ type: () => BcgwRecreationResourceDto })
  properties: BcgwRecreationResourceDto;
}

export class BcgwFeatureCollectionDto extends BcgwFeatureCollectionBaseDto {
  @ApiProperty({ isArray: true, type: () => BcgwFeatureDto })
  features: BcgwFeatureDto[];
}

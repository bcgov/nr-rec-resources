import { ApiProperty } from '@nestjs/swagger';
import {
  nullableNumberProperty,
  nullableStringProperty,
} from './bcgw-nullable-property.helpers';

/**
 * Properties shared identically by BCGW recreation line and polygon features.
 * Feature-specific properties (geometry-dependent measurements, district
 * fields, examples that differ between lines and polygons, etc.) are declared
 * on the concrete {@link BcgwRecreationLinesDto} / {@link BcgwRecreationPolygonsDto}
 * subclasses.
 */
export class BcgwRecreationFeatureBaseDto {
  @ApiProperty(
    nullableNumberProperty(
      'The number of times a feature has been amended over its lifetime.',
      1,
    ),
  )
  amendment_id: number | null;

  @ApiProperty(
    nullableStringProperty(
      'The closest town or city to the recreation feature, e.g., KELOWNA, BELLA COOLA.',
      'KELOWNA',
    ),
  )
  site_location: string | null;

  @ApiProperty({
    description:
      'For a retired recreation feature, the date and time the feature was retired.',
    type: String,
    format: 'date',
    nullable: true,
  })
  retirement_date: Date | null;

  @ApiProperty({
    description:
      'Indicates whether this is a resource feature established under the Government Action Regulation.',
    enum: ['Y', 'N'],
    nullable: true,
  })
  resource_feature_ind: string | null;

  @ApiProperty({
    description:
      'Indicates if an archaeological impact assessment has been performed for the given project.',
    enum: ['Y', 'N'],
    nullable: true,
  })
  arch_impact_assess_ind: string | null;

  @ApiProperty({
    description:
      'The date on which the recreation project was legally established.',
    type: String,
    format: 'date',
    nullable: true,
  })
  project_established_date: Date | null;

  @ApiProperty({
    enum: ['Y', 'N'],
    nullable: true,
  })
  recreation_view_ind: string | null;

  @ApiProperty({
    description: 'The total number of campsites.',
    example: 0,
  })
  defined_campsites: number;

  @ApiProperty({
    description: 'The life cycle state of the feature.',
    enum: ['PENDING', 'ACTIVE', 'RETIRED'],
    example: 'ACTIVE',
    nullable: true,
  })
  life_cycle_status_code: string | null;

  @ApiProperty({
    type: String,
    description:
      'The current status of the recreation tenure, e.g., AR (archived), HI (issued), PI (pending issuance).',
    example: 'HI',
    nullable: true,
  })
  file_status_code: string | null;
}

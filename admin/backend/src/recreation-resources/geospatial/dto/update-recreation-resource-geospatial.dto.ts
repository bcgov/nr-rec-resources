import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateRecreationMapFeatureGeometryDto {
  @ApiProperty({
    description:
      'GeoJSON geometry extracted from a validated shapefile feature',
    type: Object,
    additionalProperties: true,
  } satisfies ApiPropertyOptions)
  @IsObject()
  geometry: Record<string, unknown>;

  @ApiProperty({
    description:
      'Editable section identifier/name for the uploaded feature, if provided',
    required: false,
    nullable: true,
    example: 'River Way South',
  })
  @IsOptional()
  @IsString()
  section_id?: string | null;

  @ApiProperty({
    description:
      'Original DBF properties for this feature (e.g., FEATURE_AR, FEATURE_PE, FEATURE__1, FEATURE_LE)',
    required: false,
    nullable: true,
    type: Object,
    additionalProperties: true,
  } satisfies ApiPropertyOptions)
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown> | null;
}

/**
 * DTO used to update geospatial information for a recreation resource.
 * UTM fields (zone, easting, northing) are required together.
 */
export class UpdateRecreationResourceGeospatialDto {
  @ApiProperty({
    description: 'Validated shapefile features to persist as map feature rows',
    type: [UpdateRecreationMapFeatureGeometryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecreationMapFeatureGeometryDto)
  newFeatures: UpdateRecreationMapFeatureGeometryDto[];

  @ApiProperty({
    description: 'Validated shapefile features to persist as map feature rows',
    type: [UpdateRecreationMapFeatureGeometryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecreationMapFeatureGeometryDto)
  amendedFeatures: UpdateRecreationMapFeatureGeometryDto[];

  @ApiProperty({
    description: 'Validated shapefile features to persist as map feature rows',
    type: [UpdateRecreationMapFeatureGeometryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecreationMapFeatureGeometryDto)
  retiredFeatures: UpdateRecreationMapFeatureGeometryDto[];

  @ApiProperty({
    description: 'Recreation resource type code to store with request features',
    required: false,
    nullable: true,
    example: 'SIT',
  })
  @IsOptional()
  @IsString()
  recreation_type_code?: string | null;

  @ApiProperty({
    description: 'Submitter name/email captured at request creation time',
    required: false,
    nullable: true,
    example: 'sam.user@gov.bc.ca',
  })
  @IsOptional()
  @IsString()
  submitted_by?: string | null;

  @ApiProperty({
    description:
      'UTM zone for site point updates. Must be provided together with utm_easting and utm_northing.',
    required: false,
    nullable: true,
    minimum: 1,
    maximum: 60,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  utm_zone?: number | null;

  @ApiProperty({
    description:
      'UTM easting for site point updates. Must be provided together with utm_zone and utm_northing.',
    required: false,
    nullable: true,
    minimum: 100000,
    maximum: 999999,
    example: 500000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100000)
  @Max(999999)
  utm_easting?: number | null;

  @ApiProperty({
    description:
      'UTM northing for site point updates. Must be provided together with utm_zone and utm_easting.',
    required: false,
    nullable: true,
    minimum: 0,
    maximum: 9999999,
    example: 5450000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9999999)
  utm_northing?: number | null;

  @ApiProperty({
    description:
      'Trail right-of-way width in metres. Used when calculating derived trail area.',
    required: false,
    nullable: true,
    minimum: 0,
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  right_of_way_m?: number | null;
}

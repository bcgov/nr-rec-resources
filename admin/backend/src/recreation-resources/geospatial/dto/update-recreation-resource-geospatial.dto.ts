import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class UpdateRecreationMapFeatureGeometryDto {
  @ApiProperty({
    description:
      'GeoJSON geometry extracted from a validated shapefile feature',
    type: 'object',
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
    type: 'object',
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
}

import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsEnum,
} from 'class-validator';

export enum MapFeatureOperation {
  NEW = 'New',
  AMEND = 'Amend',
  RETIRE = 'Retire',
}

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
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecreationMapFeatureGeometryDto)
  features: UpdateRecreationMapFeatureGeometryDto[];

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
      'Operation to perform on the recreation resource geospatial data',
    enum: MapFeatureOperation,
    example: MapFeatureOperation.NEW,
    required: true,
  })
  @IsEnum(MapFeatureOperation, {
    message:
      'operation must be one of the following values: New, Amend, Retire',
  })
  operation: MapFeatureOperation;
}

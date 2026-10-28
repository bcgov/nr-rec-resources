import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateRecreationMapFeatureGeometryDto {
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
      'Optional polygon area supplied from DBF attributes (hectares). Falls back to system-calculated area when omitted.',
    required: false,
    nullable: true,
    example: 12.3456,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  feature_area_hectares?: number | null;
}

export class CreateRecreationMapFeaturesDto {
  @ApiProperty({
    description: 'Validated shapefile features to persist as map feature rows',
    type: [CreateRecreationMapFeatureGeometryDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRecreationMapFeatureGeometryDto)
  features: CreateRecreationMapFeatureGeometryDto[];

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
    description:
      'Optional recreation resource name captured with spatial submission',
    required: false,
    nullable: true,
    example: 'Sample Recreation Site',
  })
  @IsOptional()
  @IsString()
  rec_resource_name?: string | null;

  @ApiProperty({
    description:
      'Natural resource district org unit code selected during request creation',
    required: false,
    nullable: true,
    example: 'RCKL',
  })
  @IsOptional()
  @IsString()
  natural_resource_district_code?: string | null;

  @ApiProperty({
    description: 'Recreation district code selected during request creation',
    required: false,
    nullable: true,
    example: 'DCKA',
  })
  @IsOptional()
  @IsString()
  recreation_district_code?: string | null;

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

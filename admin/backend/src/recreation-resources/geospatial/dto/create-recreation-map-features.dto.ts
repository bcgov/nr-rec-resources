import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
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
  })
  @IsObject()
  geometry: Record<string, unknown>;
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

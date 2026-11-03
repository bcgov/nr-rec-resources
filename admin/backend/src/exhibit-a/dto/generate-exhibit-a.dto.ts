import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const EXHIBIT_A_ALLOWED_SCALES = [
  5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000,
] as const;

export enum ExhibitAPageSize {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum ExhibitAPageOrientation {
  Portrait = 'P',
  Landscape = 'L',
}

export class AdjudicationCommentDto {
  @ApiPropertyOptional({ example: 'OVERLAP_FOUND' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionCode?: string;

  @ApiPropertyOptional({ example: 'Overlap reviewed and accepted.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  actionComment?: string;

  @ApiPropertyOptional({ example: '8f4a42e2-d0ec-4d09-b293-02b685f19c95' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  featureOverlapGuid?: string;

  @ApiPropertyOptional({ example: '744f20da-eabf-41f3-a885-3b8bfd6ce928' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mapFeatureGuid?: string;

  @ApiPropertyOptional({ example: 'Boundary overlap with adjacent feature.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  overlapDescription?: string;
}

export class GenerateExhibitARequestDto {
  @ApiPropertyOptional({
    description: 'Optional map scale.',
    enum: EXHIBIT_A_ALLOWED_SCALES,
    example: 20000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(EXHIBIT_A_ALLOWED_SCALES)
  scale?: number;

  @ApiPropertyOptional({
    enum: ExhibitAPageSize,
    description: 'Optional page size. Defaults are computed from map extent.',
  })
  @IsOptional()
  @IsEnum(ExhibitAPageSize)
  pageSize?: ExhibitAPageSize;

  @ApiPropertyOptional({
    enum: ExhibitAPageOrientation,
    description:
      'Optional page orientation. Defaults are computed from map extent.',
  })
  @IsOptional()
  @IsEnum(ExhibitAPageOrientation)
  pageOrientation?: ExhibitAPageOrientation;

  @ApiPropertyOptional({
    description:
      'When true, returns JSON contract instead of streaming application/pdf.',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  returnJson?: boolean;
}

export class ExhibitAResultDto {
  @ApiProperty({ example: 'S1234567' })
  submissionId: string;

  @ApiPropertyOptional({
    description: 'Map image URL returned by ArcGIS export endpoint.',
  })
  mapImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Presigned URL for the generated PDF uploaded to S3.',
  })
  pdfUrl?: string;

  @ApiProperty({ enum: ExhibitAPageSize })
  pageSize: ExhibitAPageSize;

  @ApiProperty({ enum: ExhibitAPageOrientation })
  pageOrientation: ExhibitAPageOrientation;

  @ApiProperty({ example: 30000, enum: EXHIBIT_A_ALLOWED_SCALES })
  scale: number;

  @ApiPropertyOptional({
    description:
      'Base64 encoded PDF payload. Returned only when returnJson=true.',
  })
  pdfBase64?: string;
}

export class CreateExhibitAByApplicationGuidRequestDto {
  @ApiPropertyOptional({
    enum: ExhibitAPageSize,
    description: 'Requested page size for generated Exhibit A.',
  })
  @IsOptional()
  @IsEnum(ExhibitAPageSize)
  size?: ExhibitAPageSize;

  @ApiPropertyOptional({
    enum: ExhibitAPageOrientation,
    description: 'Requested page orientation for generated Exhibit A.',
    example: ExhibitAPageOrientation.Portrait,
  })
  @IsOptional()
  @IsEnum(ExhibitAPageOrientation)
  orientation?: ExhibitAPageOrientation;

  @ApiPropertyOptional({
    description: 'Requested map scale for generated Exhibit A.',
    enum: EXHIBIT_A_ALLOWED_SCALES,
    example: 30000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(EXHIBIT_A_ALLOWED_SCALES)
  scale?: number;

  @ApiPropertyOptional({
    description:
      'Optional adjudication comments saved to spatial submission as an array of objects.',
    type: [AdjudicationCommentDto],
    example: [
      {
        actionCode: 'OVERLAP_FOUND',
        actionComment: 'Reviewed and accepted.',
        featureOverlapGuid: '8f4a42e2-d0ec-4d09-b293-02b685f19c95',
        mapFeatureGuid: '744f20da-eabf-41f3-a885-3b8bfd6ce928',
        overlapDescription: 'Boundary overlap with adjacent feature.',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdjudicationCommentDto)
  adjudicationComments?: AdjudicationCommentDto[];

  @ApiProperty({
    description: 'User ID used for created_by/updated_by audit fields.',
    example: 'TESTER1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userId: string;

  @ApiProperty({
    description:
      'When true, generate and store a new Exhibit A. When false, return latest existing Exhibit A URL for the submission.',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  generate: boolean;
}

export class CreateExhibitAByApplicationGuidResultDto {
  @ApiProperty({ example: 'S1234567' })
  submissionId: string;

  @ApiProperty({
    description: 'Presigned URL for the Exhibit A PDF in S3.',
  })
  pdfUrl: string;

  @ApiPropertyOptional({ enum: ExhibitAPageSize })
  size?: ExhibitAPageSize;

  @ApiPropertyOptional({ enum: ExhibitAPageOrientation })
  orientation?: ExhibitAPageOrientation;

  @ApiPropertyOptional({ example: 30000, enum: EXHIBIT_A_ALLOWED_SCALES })
  scale?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

import { RecreationResourceImageSize } from '@shared/constants/images';

export class RecreationResourceImageVariantDto {
  @ApiProperty({
    description: 'Size code of the image variant',
    enum: RecreationResourceImageSize,
    example: RecreationResourceImageSize.ORIGINAL,
  })
  size_code: RecreationResourceImageSize;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Width of the image in pixels',
    example: 1920,
  })
  width: number;

  @ApiProperty({
    description: 'Height of the image in pixels',
    example: 1080,
  })
  height: number;

  @ApiProperty({
    description: 'File extension',
    example: 'jpg',
  })
  extension: string;
}

export class RecreationResourceImageDto {
  @ApiProperty({
    description: 'Reference ID for the image',
    example: '1000',
  })
  ref_id: string;

  @ApiProperty({
    description: 'Image ID (UUID)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
    required: false,
  })
  image_id?: string;

  @ApiProperty({
    description: 'Image file name',
    example: 'scenic-mountain-view.webp',
  })
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @ApiProperty({
    description: 'Available image variants',
    type: [RecreationResourceImageVariantDto],
    required: false,
  })
  recreation_resource_image_variants?: RecreationResourceImageVariantDto[];

  @ApiProperty({
    description: 'File upload date',
    type: String,
  })
  created_at: string | null;
}

/**
 * DTO for creating image with 4 pre-processed variants and optional consent form
 */
export class CreateRecreationResourceImageVariantsDto {
  @ApiProperty({
    description: 'Image file name',
    example: 'beautiful-mountain-view.webp',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  file_name: string;

  @ApiPropertyOptional({
    description: 'Date the photo was taken (ISO date string)',
    example: '2024-06-15',
  })
  @IsOptional()
  @IsDateString()
  date_taken?: string;

  @ApiPropertyOptional({
    description:
      'Whether the image contains personally identifiable information',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  contains_pii?: boolean;

  @ApiPropertyOptional({
    description: 'Type of photographer (database code)',
    example: 'STAFF',
  })
  @IsOptional()
  @IsString()
  photographer_type?: string;

  @ApiPropertyOptional({
    description: 'Name of the photographer for attribution',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  photographer_name?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateNested,
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
 * DTO for presigned upload URL response - single image variant
 */
export class ImagePresignedUrlDto {
  @ApiProperty({
    description: 'S3 object key for this variant',
    example: 'images/REC204118/a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9/scr.webp',
  })
  key: string;

  @ApiProperty({
    description: 'Presigned PUT URL for uploading to S3',
    example: 'https://bucket.s3.amazonaws.com/images/REC204118/...',
  })
  url: string;

  @ApiProperty({
    description: 'Size code of the image variant',
    enum: RecreationResourceImageSize,
    example: RecreationResourceImageSize.SCREEN,
  })
  size_code: RecreationResourceImageSize;
}

/**
 * DTO for image presign endpoint response
 */
export class PresignImageUploadResponseDto {
  @ApiProperty({
    description: 'Allocated image ID (UUID)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  image_id: string;

  @ApiProperty({
    description: 'Array of presigned URLs for 4 image variants',
    type: [ImagePresignedUrlDto],
  })
  presigned_urls: ImagePresignedUrlDto[];
}

/**
 * DTO for consent form metadata
 */
export class ConsentFormMetadataDto {
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

/**
 * DTO for image finalize endpoint request
 */
export class FinalizeImageUploadRequestDto {
  @ApiProperty({
    description: 'Image ID (returned from presign endpoint)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @IsNotEmpty()
  @IsString()
  image_id: string;

  @ApiProperty({
    description: 'Original image file name',
    example: 'beautiful-mountain-view.webp',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  file_name: string;

  @ApiProperty({
    description: 'Size of the original image variant in bytes',
    example: 2097152,
  })
  @IsNotEmpty()
  file_size_original: number;

  @ApiProperty({
    description: 'Sizes of screen variant in bytes',
    example: 1048576,
  })
  @IsNotEmpty()
  file_size_scr: number;

  @ApiProperty({
    description: 'Size of preview variant in bytes',
    example: 524288,
  })
  @IsNotEmpty()
  file_size_pre: number;

  @ApiProperty({
    description: 'Size of thumbnail variant in bytes',
    example: 262144,
  })
  @IsNotEmpty()
  file_size_thm: number;

  @ApiPropertyOptional({
    description:
      'Consent form metadata (required when uploading consent form PDF)',
    type: () => ConsentFormMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsentFormMetadataDto)
  consent?: ConsentFormMetadataDto;
}

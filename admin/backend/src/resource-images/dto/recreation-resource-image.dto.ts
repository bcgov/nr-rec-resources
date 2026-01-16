import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceImageSize {
  /** Original upload size */
  ORIGINAL = 'original',

  /** Collection view thumbnail (100x75) */
  COLLECTION = 'col',

  /** Content page header image (1110x740) */
  CONTENT_HEADER = 'con',

  /** Content page link card image (377x251) */
  CONTENT_CARD = 'pcs',

  /** High resolution print quality image (999999x999999) */
  HIGH_RES_PRINT = 'hpr',

  /** Inline content image (788x525) */
  INLINE = 'ili',

  /** Landing page header image (720x780) */
  LANDING_HEADER = 'lan',

  /** Landing page link card image (630x380) */
  LANDING_CARD = 'llc',

  /** Low resolution print image (1000x1000) */
  LOW_RES_PRINT = 'lpr',

  /** Park photo gallery image (1734x1156) */
  GALLERY = 'gal',

  /** Presentation slide image (1920x1080) */
  PRESENTATION = 'ppp',

  /** Preview image (900x480) */
  PREVIEW = 'pre',

  /** Search result image (525x394) */
  SEARCH = 'rsr',

  /** RST thumbnail image (75x56) */
  RST_THUMB = 'rth',

  /** Screen resolution image (1400x800) */
  SCREEN = 'scr',

  /** Standard thumbnail image (175x175) */
  THUMBNAIL = 'thm',
}

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

export class CreateRecreationResourceImageBodyDto {
  @ApiProperty({
    description: 'Image file name',
    example: 'scenic-mountain-view.webp',
    minLength: 1,
    maxLength: 255,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  file_name: string;
}

export class CreateRecreationResourceImageFormDto {
  @ApiProperty({
    description: 'Image file name',
    example: 'scenic-mountain-view.webp',
    minLength: 1,
    maxLength: 255,
    type: String,
  })
  file_name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;
}

/**
 * DTO for creating image with 4 pre-processed variants
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
}

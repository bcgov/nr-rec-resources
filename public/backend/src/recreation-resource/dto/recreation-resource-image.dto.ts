import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * URL object containing full URLs for requested image variants.
 * All properties are optional - only requested variants are included.
 */
export class RecreationResourceImageUrlDto {
  @ApiPropertyOptional({
    description: 'Original size image URL',
    example:
      'https://example.com/images/REC203239/550e8400-e29b-41d4-a716-446655440000/original.webp',
  })
  original?: string;

  @ApiPropertyOptional({
    description: 'Thumbnail (175x175) image URL',
    example:
      'https://example.com/images/REC203239/550e8400-e29b-41d4-a716-446655440000/thm.webp',
  })
  thm?: string;

  @ApiPropertyOptional({
    description: 'Preview (900x480) image URL',
    example:
      'https://example.com/images/REC203239/550e8400-e29b-41d4-a716-446655440000/pre.webp',
  })
  pre?: string;

  @ApiPropertyOptional({
    description: 'Screen resolution (1400x800) image URL',
    example:
      'https://example.com/images/REC203239/550e8400-e29b-41d4-a716-446655440000/scr.webp',
  })
  scr?: string;
}

export class RecreationResourceImageDto {
  @ApiProperty({
    description: 'Image ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  image_id: string;

  @ApiProperty({
    description:
      'URL object containing full URLs for requested image variants. Default returns only original.',
    type: RecreationResourceImageUrlDto,
  })
  url: RecreationResourceImageUrlDto;
}

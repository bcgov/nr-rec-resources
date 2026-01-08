import { describe, expect, it } from 'vitest';
import {
  RecreationResourceImageDto,
  RecreationResourceImageSize,
  RecreationResourceImageUrlDto,
} from './recreation-resource-image.dto';

describe('RecreationResourceImageDto', () => {
  it('should create an instance with valid properties', () => {
    const urlDto = new RecreationResourceImageUrlDto();
    urlDto.original = 'https://example.com/images/original.webp';
    urlDto.thm = 'https://example.com/images/thm.webp';
    urlDto.pre = 'https://example.com/images/pre.webp';
    urlDto.scr = 'https://example.com/images/scr.webp';

    const dto = new RecreationResourceImageDto();
    dto.image_id = '550e8400-e29b-41d4-a716-446655440000';
    dto.url = urlDto;

    expect(dto).toBeInstanceOf(RecreationResourceImageDto);
    expect(dto.image_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(dto.url.original).toBe('https://example.com/images/original.webp');
    expect(dto.url.thm).toBe('https://example.com/images/thm.webp');
    expect(dto.url.pre).toBe('https://example.com/images/pre.webp');
    expect(dto.url.scr).toBe('https://example.com/images/scr.webp');
  });

  it('should validate RecreationResourceImageSize enum values', () => {
    expect(RecreationResourceImageSize.ORIGINAL).toBe('original');
    expect(RecreationResourceImageSize.THUMBNAIL).toBe('thm');
    expect(RecreationResourceImageSize.PREVIEW).toBe('pre');
    expect(RecreationResourceImageSize.SCREEN).toBe('scr');
  });

  it('should allow partial url properties', () => {
    const urlDto = new RecreationResourceImageUrlDto();
    urlDto.original = 'https://example.com/images/original.webp';

    const dto = new RecreationResourceImageDto();
    dto.image_id = '550e8400-e29b-41d4-a716-446655440000';
    dto.url = urlDto;

    expect(dto.url.original).toBe('https://example.com/images/original.webp');
    expect(dto.url.thm).toBeUndefined();
    expect(dto.url.pre).toBeUndefined();
    expect(dto.url.scr).toBeUndefined();
  });
});

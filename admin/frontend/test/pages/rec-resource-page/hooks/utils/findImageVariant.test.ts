import { findImageVariant } from '@/pages/rec-resource-page/hooks/utils/findImageVariant';
import { RecreationResourceImageVariantDto } from '@/services/recreation-resource-admin';
import { describe, expect, it } from 'vitest';

describe('findImageVariant', () => {
  const createMockVariant = (
    sizeCode: string,
    url: string,
  ): RecreationResourceImageVariantDto => ({
    size_code: sizeCode as any,
    url,
    extension: 'webp',
    width: 100,
    height: 100,
  });

  it('should find variant by size code "original"', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('pre', 'https://example.com/preview.webp'),
    ];

    const result = findImageVariant(variants, 'original');

    expect(result).toBeDefined();
    expect(result?.size_code).toBe('original');
    expect(result?.url).toBe('https://example.com/original.webp');
  });

  it('should find variant by size code "scr"', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('scr', 'https://example.com/screen.webp'),
      createMockVariant('pre', 'https://example.com/preview.webp'),
    ];

    const result = findImageVariant(variants, 'scr');

    expect(result).toBeDefined();
    expect(result?.size_code).toBe('scr');
    expect(result?.url).toBe('https://example.com/screen.webp');
  });

  it('should find variant by size code "pre"', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('pre', 'https://example.com/preview.webp'),
      createMockVariant('thm', 'https://example.com/thumb.webp'),
    ];

    const result = findImageVariant(variants, 'pre');

    expect(result).toBeDefined();
    expect(result?.size_code).toBe('pre');
    expect(result?.url).toBe('https://example.com/preview.webp');
  });

  it('should find variant by size code "thm"', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('thm', 'https://example.com/thumb.webp'),
    ];

    const result = findImageVariant(variants, 'thm');

    expect(result).toBeDefined();
    expect(result?.size_code).toBe('thm');
    expect(result?.url).toBe('https://example.com/thumb.webp');
  });

  it('should return undefined when variant not found', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('pre', 'https://example.com/preview.webp'),
    ];

    const result = findImageVariant(variants, 'thm');

    expect(result).toBeUndefined();
  });

  it('should return undefined when variants array is undefined', () => {
    const result = findImageVariant(undefined, 'original');

    expect(result).toBeUndefined();
  });

  it('should return undefined when variants array is empty', () => {
    const result = findImageVariant([], 'original');

    expect(result).toBeUndefined();
  });

  it('should find correct variant when multiple variants are present', () => {
    const variants = [
      createMockVariant('original', 'https://example.com/original.webp'),
      createMockVariant('scr', 'https://example.com/screen.webp'),
      createMockVariant('pre', 'https://example.com/preview.webp'),
      createMockVariant('thm', 'https://example.com/thumb.webp'),
    ];

    const original = findImageVariant(variants, 'original');
    const screen = findImageVariant(variants, 'scr');
    const preview = findImageVariant(variants, 'pre');
    const thumb = findImageVariant(variants, 'thm');

    expect(original?.size_code).toBe('original');
    expect(screen?.size_code).toBe('scr');
    expect(preview?.size_code).toBe('pre');
    expect(thumb?.size_code).toBe('thm');
  });
});

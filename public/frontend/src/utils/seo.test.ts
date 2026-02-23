import { SITE_METADATA } from '@/constants/seo';
import {
  buildAbsoluteUrl,
  buildOgMeta,
  getResourceMetaDescription,
} from '@/utils/seo';

describe('SEO Utils', () => {
  describe('getResourceMetaDescription', () => {
    it('should return the site description when provided', () => {
      const description = 'Test site';
      expect(getResourceMetaDescription(description)).toBe(description);
    });

    it('should truncate long descriptions to 155 characters', () => {
      const longDescription = 'a'.repeat(200);
      const result = getResourceMetaDescription(longDescription);
      expect(result.length).toBe(155);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should use resource name when description is missing', () => {
      const result = getResourceMetaDescription(undefined, 'Test Site');
      expect(result).toBe('Details information about Test Site.');
    });
  });

  describe('buildAbsoluteUrl', () => {
    it('should return an empty string when no path is provided', () => {
      expect(buildAbsoluteUrl()).toBe('');
    });

    it('should return a full URL as-is', () => {
      expect(buildAbsoluteUrl('https://example.com/test')).toBe(
        'https://example.com/test',
      );
    });

    it('should return a relative path when site URL is unavailable', () => {
      const originalUrl = SITE_METADATA.url;
      (SITE_METADATA as { url: string }).url = '';
      expect(buildAbsoluteUrl('/test')).toBe('/test');
      (SITE_METADATA as { url: string }).url = originalUrl;
    });

    it('should prefix site URL for relative paths', () => {
      const originalUrl = SITE_METADATA.url;
      (SITE_METADATA as { url: string }).url = 'https://example.com';
      expect(buildAbsoluteUrl('/test')).toBe('https://example.com/test');
      expect(buildAbsoluteUrl('test')).toBe('https://example.com/test');
      (SITE_METADATA as { url: string }).url = originalUrl;
    });
  });

  describe('buildOgMeta', () => {
    it('should build default open graph meta tags', () => {
      const result = buildOgMeta({
        title: 'Test Title',
        description: 'Test description',
        url: 'https://example.com/test',
        image: 'https://example.com/og.png',
      });

      expect(result).toEqual(
        expect.arrayContaining([
          { property: 'og:title', content: 'Test Title' },
          { property: 'og:description', content: 'Test description' },
          { property: 'og:type', content: SITE_METADATA.type },
          { property: 'og:site_name', content: SITE_METADATA.title },
          { property: 'og:locale', content: SITE_METADATA.locale },
          { property: 'og:url', content: 'https://example.com/test' },
          { property: 'og:image', content: 'https://example.com/og.png' },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          {
            property: 'og:image:alt',
            content: 'Recreation Sites and Trails BC logo',
          },
        ]),
      );
    });

    it('should allow overrides', () => {
      const result = buildOgMeta({
        title: 'Alt Title',
        description: 'Alt description',
        url: 'https://example.com/alt',
        image: 'https://example.com/alt.png',
        imageAlt: 'Custom alt',
        imageWidth: 800,
        imageHeight: 600,
        type: 'article',
        siteName: 'Custom Site',
        locale: 'en_US',
      });

      expect(result).toEqual(
        expect.arrayContaining([
          { property: 'og:type', content: 'article' },
          { property: 'og:site_name', content: 'Custom Site' },
          { property: 'og:locale', content: 'en_US' },
          { property: 'og:image:width', content: '800' },
          { property: 'og:image:height', content: '600' },
          { property: 'og:image:alt', content: 'Custom alt' },
        ]),
      );
    });
  });
});

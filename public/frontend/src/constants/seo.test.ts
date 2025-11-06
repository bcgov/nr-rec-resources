import {
  SITE_METADATA,
  META_DESCRIPTIONS,
  getResourceMetaDescription,
} from '@/constants/seo';

describe('SEO Constants', () => {
  describe('SITE_METADATA', () => {
    it('should have correct values', () => {
      expect(SITE_METADATA.title).toBe('Sites and Trails BC');
      expect(SITE_METADATA.locale).toBe('en_CA');
    });
  });

  describe('META_DESCRIPTIONS', () => {
    it('should have descriptions for all routes', () => {
      expect(META_DESCRIPTIONS.HOME).toBeDefined();
      expect(META_DESCRIPTIONS.SEARCH).toBeDefined();
      expect(META_DESCRIPTIONS.CONTACT).toBeDefined();
    });
  });

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
});

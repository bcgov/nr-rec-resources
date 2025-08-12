import { ROUTE_PATHS, SITE_TITLE, ROUTE_TITLES } from './constants';

describe('Route Constants', () => {
  describe('ROUTE_PATHS', () => {
    it('should have correct home path', () => {
      expect(ROUTE_PATHS.HOME).toBe('/');
    });

    it('should have correct search path', () => {
      expect(ROUTE_PATHS.SEARCH).toBe('/search');
    });

    it('should have correct recreation resource path with parameter', () => {
      expect(ROUTE_PATHS.REC_RESOURCE).toBe('/resource/:id');
    });

    it('should have correct not found path', () => {
      expect(ROUTE_PATHS.NOT_FOUND).toBe('*');
    });

    it('should have correct contact us path', () => {
      expect(ROUTE_PATHS.CONTACT_US).toBe('/contact');
    });

    it('should have correct recreation resource contact path', () => {
      expect(ROUTE_PATHS.REC_RESOURCE_CONTACT).toBe('/resource/:id/contact');
    });
  });

  describe('SITE_TITLE', () => {
    it('should have correct site title', () => {
      expect(SITE_TITLE).toBe('Sites and Trails BC');
    });
  });

  describe('ROUTE_TITLES', () => {
    it('should have correct home title', () => {
      expect(ROUTE_TITLES.HOME).toBe(SITE_TITLE);
    });

    it('should have correct search title', () => {
      expect(ROUTE_TITLES.SEARCH).toBe(`Find a site or trail | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource title with name', () => {
      const resourceName = 'Test Resource';
      const result = ROUTE_TITLES.REC_RESOURCE(resourceName);
      expect(result).toBe(`${resourceName} | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource title with empty name', () => {
      const result = ROUTE_TITLES.REC_RESOURCE('');
      expect(result).toBe(` | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource title with undefined name', () => {
      const result = ROUTE_TITLES.REC_RESOURCE(undefined as any);
      expect(result).toBe(`undefined | ${SITE_TITLE}`);
    });

    it('should have correct not found title', () => {
      expect(ROUTE_TITLES.NOT_FOUND).toBe(`404 | ${SITE_TITLE}`);
    });

    it('should have correct contact title', () => {
      expect(ROUTE_TITLES.CONTACT).toBe(`Contact Us | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource contact title with name', () => {
      const resourceName = 'Test Resource';
      const result = ROUTE_TITLES.REC_RESOURCE_CONTACT(resourceName);
      expect(result).toBe(`Contact Us - ${resourceName} | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource contact title with empty name', () => {
      const result = ROUTE_TITLES.REC_RESOURCE_CONTACT('');
      expect(result).toBe(`Contact Us | ${SITE_TITLE}`);
    });

    it('should generate correct recreation resource contact title with undefined name', () => {
      const result = ROUTE_TITLES.REC_RESOURCE_CONTACT(undefined as any);
      expect(result).toBe(`Contact Us | ${SITE_TITLE}`);
    });
  });
});

import { ROUTE_PATHS } from '@/constants/routes';
import {
  REC_RESOURCE_PAGE_NAV_SECTIONS,
  RecResourceNavKey,
} from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';

describe('rec-resource-page navigation', () => {
  describe('REC_RESOURCE_PAGE_NAV_SECTIONS', () => {
    it('has correct overview tab configuration', () => {
      const overviewTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.OVERVIEW];
      expect(overviewTab.title).toBe('Overview');
      expect(overviewTab.getNavigateOptions('123')).toEqual({
        to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
        params: { id: '123' },
      });
    });

    it('has correct files tab configuration', () => {
      const filesTab = REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.FILES];
      expect(filesTab.title).toBe('Images & Sitemaps');
      expect(filesTab.getNavigateOptions('123')).toEqual({
        to: ROUTE_PATHS.REC_RESOURCE_FILES,
        params: { id: '123' },
      });
    });

    it('has correct activities tab configuration (lines 37-39)', () => {
      const activitiesTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.ACTIVITIES];
      expect(activitiesTab.title).toBe('Activities & features');
      expect(activitiesTab.getNavigateOptions('123')).toEqual({
        to: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES,
        params: { id: '123' },
      });
    });

    it('has tabs for all tab keys', () => {
      expect(Object.keys(REC_RESOURCE_PAGE_NAV_SECTIONS)).toEqual([
        RecResourceNavKey.OVERVIEW,
        RecResourceNavKey.FILES,
        RecResourceNavKey.ACTIVITIES,
        RecResourceNavKey.FEES,
        RecResourceNavKey.GEOSPATIAL,
      ]);
    });

    it('getNavigateOptions functions work with different IDs', () => {
      const overviewTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.OVERVIEW];
      const filesTab = REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.FILES];

      expect(overviewTab.getNavigateOptions('abc')).toEqual({
        to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
        params: { id: 'abc' },
      });
      expect(filesTab.getNavigateOptions('xyz')).toEqual({
        to: ROUTE_PATHS.REC_RESOURCE_FILES,
        params: { id: 'xyz' },
      });
    });

    it('getNavigateOptions functions return correct types', () => {
      const overviewTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.OVERVIEW];
      const result = overviewTab.getNavigateOptions('test');

      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('params');
      expect(result.to).toBe(ROUTE_PATHS.REC_RESOURCE_OVERVIEW);
      expect(result.params).toEqual({ id: 'test' });
    });

    it('has consistent structure for all navigation sections', () => {
      Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).forEach(([_, section]) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('getNavigateOptions');
        expect(typeof section.title).toBe('string');
        expect(typeof section.getNavigateOptions).toBe('function');
      });
    });
  });
});

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
      expect(overviewTab.route('123')).toBe('/rec-resource/123');
    });

    it('has correct files tab configuration', () => {
      const filesTab = REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.FILES];
      expect(filesTab.title).toBe('Files');
      expect(filesTab.route('123')).toBe('/rec-resource/123/files');
    });

    it('has tabs for all tab keys', () => {
      expect(Object.keys(REC_RESOURCE_PAGE_NAV_SECTIONS)).toEqual([
        RecResourceNavKey.OVERVIEW,
        RecResourceNavKey.FILES,
      ]);
    });

    it('route functions work with different IDs', () => {
      const overviewTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.OVERVIEW];
      const filesTab = REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.FILES];

      expect(overviewTab.route('abc')).toBe('/rec-resource/abc');
      expect(filesTab.route('xyz')).toBe('/rec-resource/xyz/files');
    });

    it('route functions return correct types', () => {
      const overviewTab =
        REC_RESOURCE_PAGE_NAV_SECTIONS[RecResourceNavKey.OVERVIEW];
      const result = overviewTab.route('test');

      expect(typeof result).toBe('string');
      expect(result.startsWith('/')).toBe(true);
    });

    it('has consistent structure for all navigation sections', () => {
      Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).forEach(([_, section]) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('route');
        expect(typeof section.title).toBe('string');
        expect(typeof section.route).toBe('function');
      });
    });
  });
});

import { describe, it, beforeEach, vi, expect } from 'vitest';
import { trackEvent, trackClickEvent, trackSiteSearch } from '@/utils/matomo';

declare global {
  interface Window {
    _paq?: (string | any[])[];
  }
}

describe('Matomo tracking functions', () => {
  beforeEach(() => {
    window._paq = [];
  });

  describe('trackEvent', () => {
    it('should push correct event to _paq', () => {
      trackEvent({
        category: 'Test Category',
        action: 'Test Action',
        name: 'Test Name',
        value: 123,
      });

      expect(window._paq).toEqual([
        ['trackEvent', 'Test Category', 'Test Action', 'Test Name', 123],
      ]);
    });

    it('should not throw if optional parameters are missing', () => {
      trackEvent({
        category: 'Test Category',
      });

      expect(window._paq).toEqual([
        ['trackEvent', 'Test Category', undefined, undefined, undefined],
      ]);
    });

    it('should not push anything if window._paq is undefined', () => {
      delete window._paq;

      expect(() => {
        trackEvent({ category: 'Test Category' });
      }).not.toThrow();
    });
  });

  describe('trackClickEvent', () => {
    it('should call trackEvent with default action "Click"', () => {
      const spy = vi.spyOn(window._paq!, 'push');

      const clickHandler = trackClickEvent({
        category: 'Button',
        name: 'Submit',
        value: 1,
      });

      clickHandler();

      expect(window._paq).toEqual([
        ['trackEvent', 'Button', 'Click', 'Submit', 1],
      ]);

      spy.mockRestore();
    });
  });

  describe('trackSiteSearch', () => {
    it('should push correct site search event to _paq', () => {
      trackSiteSearch({
        keyword: 'Test Keyword',
        category: 'Test Category',
        resultsCount: 10,
      });

      expect(window._paq).toEqual([
        ['trackSiteSearch', 'Test Keyword', 'Test Category', 10],
      ]);
    });

    it('should work without resultsCount', () => {
      trackSiteSearch({
        keyword: 'Test Keyword',
        category: 'Test Category',
      });

      expect(window._paq).toEqual([
        ['trackSiteSearch', 'Test Keyword', 'Test Category', undefined],
      ]);
    });

    it('should not push anything if window._paq is undefined', () => {
      delete window._paq;

      expect(() => {
        trackSiteSearch({
          keyword: 'Test Keyword',
          category: 'Test Category',
        });
      }).not.toThrow();
    });
  });
});

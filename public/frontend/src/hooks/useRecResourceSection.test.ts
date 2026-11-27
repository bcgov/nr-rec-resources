import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRecResourceSections } from './useRecResourceSection';
import { SectionIds } from '@/components/rec-resource/enum';

describe('useRecResourceSections', () => {
  const createMockRecResource = (overrides = {}) => ({
    name: 'test resource',
    recreation_resource_images: [],
    recreation_access: [],
    recreation_activity: [],
    accessible_recreation_activity: [],
    overnight_fees: [],
    trail_use_fees: [],
    additional_fees: [],
    recreation_structure: {
      has_toilet: false,
      has_table: false,
    },
    top_access_status_grouplabel: null,
    advisories: [],
    ...overrides,
  });

  describe('basic rendering', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(createMockRecResource()),
      );

      expect(result.current).toHaveProperty('formattedName');
      expect(result.current).toHaveProperty('photos');
      expect(result.current).toHaveProperty('uniqueRecreationAccess');
      expect(result.current).toHaveProperty('allActivities');
      expect(result.current).toHaveProperty('closureAdvisory');
      expect(result.current).toHaveProperty('isClosures');
      expect(result.current).toHaveProperty('isSiteDescription');
      expect(result.current).toHaveProperty('showCampingSection');
      expect(result.current).toHaveProperty('isFeesAvailable');
      expect(result.current).toHaveProperty('isThingsToDo');
      expect(result.current).toHaveProperty('isAccessibleActivities');
      expect(result.current).toHaveProperty('isFacilitiesAvailable');
      expect(result.current).toHaveProperty('isMapsAndLocation');
      expect(result.current).toHaveProperty('isRecreationSite');
      expect(result.current).toHaveProperty('isPhotoGallery');
      expect(result.current).toHaveProperty('isReservable');
      expect(result.current).toHaveProperty('isCampingAvailable');
      expect(result.current).toHaveProperty('isAdditionalFeesAvailable');
      expect(result.current).toHaveProperty('pageSections');
    });
  });
  describe('closures section', () => {
    const closedAdvisory = {
      title: 'Wildfire closure',
      access_status_grouplabel: 'Closed',
    };

    it('uses the top advisory when it is Closed or Restricted', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            top_access_status_grouplabel: 'Closed',
            advisories: [
              closedAdvisory,
              { title: 'Other', access_status_grouplabel: 'Open' },
            ],
          }),
        ),
      );

      expect(result.current.isClosures).toBe(true);
      expect(result.current.closureAdvisory).toEqual(closedAdvisory);
    });

    it('treats Restricted as a closure', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            top_access_status_grouplabel: 'Restricted',
            advisories: [
              { title: 'Bridge out', access_status_grouplabel: 'Restricted' },
            ],
          }),
        ),
      );

      expect(result.current.isClosures).toBe(true);
    });

    it('is hidden when the top advisory is not a closure', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            top_access_status_grouplabel: 'Visit with caution',
            advisories: [
              {
                title: 'Trail washout',
                access_status_grouplabel: 'Visit with caution',
              },
            ],
          }),
        ),
      );

      expect(result.current.isClosures).toBe(false);
      expect(result.current.closureAdvisory).toBeUndefined();
    });

    it('skips advisories that are not in effect yet', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            top_access_status_grouplabel: 'Closed',
            advisories: [
              {
                title: 'Upcoming closure',
                access_status_grouplabel: 'Closed',
                effective_date: new Date('2999-01-01T00:00:00Z'),
              },
              closedAdvisory,
            ],
          }),
        ),
      );

      expect(result.current.closureAdvisory).toEqual(closedAdvisory);
    });

    it('is hidden when there are no advisories', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(createMockRecResource()),
      );

      expect(result.current.isClosures).toBe(false);
    });
  });

  describe('camping section', () => {
    it('should show camping section when campsites exist and no camping fee', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            campsite_count: 50,
            overnight_fees: [{ recreation_fee_sub_code: 'X' }], // Not camping fee
          }),
        ),
      );

      expect(result.current.isCampingAvailable).toBe(true);
      expect(result.current.showCampingSection).toBe(true);
    });

    it('should not show camping section when camping fee exists', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            campsite_count: 50,
            overnight_fees: [{ recreation_fee_sub_code: 'C' }],
          }),
        ),
      );

      expect(result.current.isCampingAvailable).toBe(true);
      expect(result.current.showCampingSection).toBe(false);
    });

    it('should not show camping section when no campsites', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            campsite_count: 0,
          }),
        ),
      );

      expect(result.current.isCampingAvailable).toBe(false);
      expect(result.current.showCampingSection).toBe(false);
    });
  });
  describe('page sections', () => {
    it('should include all sections in pageSections array', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(createMockRecResource()),
      );

      expect(result.current.pageSections).toBeDefined();
      expect(Array.isArray(result.current.pageSections)).toBe(true);

      const sectionIds = result.current.pageSections.map((s) => s.id);
      expect(sectionIds).toEqual([
        SectionIds.CLOSURES,
        SectionIds.SITE_DESCRIPTION,
        SectionIds.KNOW_BEFORE_YOU_GO,
        SectionIds.CAMPING,
        SectionIds.FEES,
        SectionIds.THINGS_TO_DO,
        SectionIds.ACCESSIBLE_RECREATION,
        SectionIds.FACILITIES,
        SectionIds.MAPS_AND_LOCATION,
        SectionIds.CONTACT,
      ]);
    });

    it('should show only visible sections', () => {
      const { result } = renderHook(() =>
        useRecResourceSections(
          createMockRecResource({
            description: 'Test description',
            recreation_activity: ['Hiking'],
          }),
        ),
      );

      const visibleSections = result.current.pageSections.filter(
        (s) => s.isVisible,
      );
      expect(visibleSections.length).toBeGreaterThan(0);

      const descriptionSection = visibleSections.find(
        (s) => s.id === SectionIds.SITE_DESCRIPTION,
      );
      expect(descriptionSection).toBeDefined();
    });
  });
});

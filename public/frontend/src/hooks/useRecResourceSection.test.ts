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
    recreation_status: {
      status_code: 1,
      description: 'Open',
      comment: '',
    },
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
      expect(result.current).toHaveProperty('statusCode');
      expect(result.current).toHaveProperty('statusDescription');
      expect(result.current).toHaveProperty('statusComment');
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
      expect(sectionIds).toContain(SectionIds.CLOSURES);
      expect(sectionIds).toContain(SectionIds.SITE_DESCRIPTION);
      expect(sectionIds).toContain(SectionIds.CAMPING);
      expect(sectionIds).toContain(SectionIds.FEES);
      expect(sectionIds).toContain(SectionIds.THINGS_TO_DO);
      expect(sectionIds).toContain(SectionIds.ACCESSIBLE_RECREATION);
      expect(sectionIds).toContain(SectionIds.FACILITIES);
      expect(sectionIds).toContain(SectionIds.MAPS_AND_LOCATION);
      expect(sectionIds).toContain(SectionIds.KNOW_BEFORE_YOU_GO);
      expect(sectionIds).toContain(SectionIds.CONTACT);
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

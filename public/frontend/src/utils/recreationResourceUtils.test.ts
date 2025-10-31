import { describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  getRecResourceDetailPageUrl,
  isInterpretiveForest,
  isRecreationSite,
  isRecreationTrail,
} from '@/utils/recreationResourceUtils';

describe('getRecResourceDetailPageUrl', () => {
  const mockOrigin = 'https://example.com';
  const testRecResourceId = '123abc';

  // Mock window.location for browser environment
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: mockOrigin,
      },
      writable: true,
    });
  });

  it('should return full URL with origin when in browser environment', () => {
    const expectedUrl = `${mockOrigin}${ROUTE_PATHS.REC_RESOURCE.replace('$id', testRecResourceId)}`;
    const result = getRecResourceDetailPageUrl(testRecResourceId);
    expect(result).toBe(expectedUrl);
  });

  it('should return path-only URL when window is undefined', () => {
    // Simulate server-side environment
    const windowSpy = vi.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(
      () => undefined as unknown as Window & typeof globalThis,
    );

    const expectedUrl = ROUTE_PATHS.REC_RESOURCE.replace(
      '$id',
      testRecResourceId,
    );
    const result = getRecResourceDetailPageUrl(testRecResourceId);
    expect(result).toBe(expectedUrl);

    windowSpy.mockRestore();
  });

  it('should correctly replace :id parameter in route', () => {
    const result = getRecResourceDetailPageUrl(testRecResourceId);
    expect(result).not.toContain('$id');
    expect(result).toContain(testRecResourceId);
  });

  it('should handle empty recResourceId', () => {
    const emptyId = '';
    const result = getRecResourceDetailPageUrl(emptyId);
    expect(result).toBe(
      `${mockOrigin}${ROUTE_PATHS.REC_RESOURCE.replace('$id', emptyId)}`,
    );
  });

  describe('isRecreationTrail', () => {
    it('returns true for rec_resource_type "recreation trail"', () => {
      expect(
        isRecreationTrail({ rec_resource_type: 'Recreation Trail' } as any),
      ).toBe(true);
      expect(
        isRecreationTrail({ rec_resource_type: 'recreation trail' } as any),
      ).toBe(true);
    });
    it('returns false for other types', () => {
      expect(
        isRecreationTrail({ rec_resource_type: 'Recreation Site' } as any),
      ).toBe(false);
    });
  });

  describe('isRecreationSite', () => {
    it('returns true for rec_resource_type "recreation site"', () => {
      expect(
        isRecreationSite({ rec_resource_type: 'Recreation Site' } as any),
      ).toBe(true);
      expect(
        isRecreationSite({ rec_resource_type: 'recreation site' } as any),
      ).toBe(true);
    });
    it('returns false for other types', () => {
      expect(
        isRecreationSite({ rec_resource_type: 'Recreation Trail' } as any),
      ).toBe(false);
    });
  });

  describe('isInterpretiveForest', () => {
    it('returns true for rec_resource_type "interpretive forest"', () => {
      expect(
        isInterpretiveForest({
          rec_resource_type: 'Interpretive Forest',
        } as any),
      ).toBe(true);
      expect(
        isInterpretiveForest({
          rec_resource_type: 'interpretive forest',
        } as any),
      ).toBe(true);
    });
    it('returns false for other types', () => {
      expect(
        isInterpretiveForest({ rec_resource_type: 'Recreation Site' } as any),
      ).toBe(false);
    });
  });
});

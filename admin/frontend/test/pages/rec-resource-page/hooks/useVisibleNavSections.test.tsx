import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { useVisibleNavSections } from '@/pages/rec-resource-page/hooks/useVisibleNavSections';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

describe('useVisibleNavSections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only non-feature-flagged sections when flagged content is not viewable', () => {
    mockUseAuthorizations.mockReturnValue({
      canViewFeatureFlag: false,
    });

    const { result } = renderHook(() => useVisibleNavSections());

    expect(result.current).toHaveLength(2);
    expect(result.current.map(([key]) => key)).toEqual([
      RecResourceNavKey.FILES,
      RecResourceNavKey.RESERVATION,
    ]);
  });

  it('returns all sections when flagged content is viewable', () => {
    mockUseAuthorizations.mockReturnValue({
      canViewFeatureFlag: true,
    });

    const { result } = renderHook(() => useVisibleNavSections());

    expect(result.current).toHaveLength(6);
    expect(result.current.map(([key]) => key)).toEqual([
      RecResourceNavKey.OVERVIEW,
      RecResourceNavKey.FILES,
      RecResourceNavKey.ACTIVITIES,
      RecResourceNavKey.FEES,
      RecResourceNavKey.GEOSPATIAL,
      RecResourceNavKey.RESERVATION,
    ]);
  });

  it('should return sections with correct structure', () => {
    mockUseAuthorizations.mockReturnValue({
      canViewFeatureFlag: true,
    });

    const { result } = renderHook(() => useVisibleNavSections());

    result.current.forEach(([key, config]) => {
      expect(typeof key).toBe('string');
      expect(config).toHaveProperty('title');
      expect(config).toHaveProperty('getNavigateOptions');
      expect(typeof config.title).toBe('string');
      expect(typeof config.getNavigateOptions).toBe('function');
    });
  });
});

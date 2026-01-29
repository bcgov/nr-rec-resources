import * as featureFlags from '@/contexts/feature-flags';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { useVisibleNavSections } from '@/pages/rec-resource-page/hooks/useVisibleNavSections';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/feature-flags', () => ({
  useFeatureFlagContext: vi.fn(),
}));

describe('useVisibleNavSections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all sections when no feature flags are required', () => {
    vi.mocked(featureFlags.useFeatureFlagContext).mockReturnValue({
      enable_full_features: false,
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

  it('should include fees section when enable_full_features is true', () => {
    vi.mocked(featureFlags.useFeatureFlagContext).mockReturnValue({
      enable_full_features: true,
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
    vi.mocked(featureFlags.useFeatureFlagContext).mockReturnValue({
      enable_full_features: true,
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

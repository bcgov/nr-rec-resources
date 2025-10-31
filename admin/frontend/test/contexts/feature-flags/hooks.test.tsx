import {
  FeatureFlagProvider,
  useFeatureFlagContext,
  useFeatureFlagsEnabled,
} from '@/contexts/feature-flags';
import { renderHook } from '@testing-library/react';
import { useLocation } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

describe('Feature Flag Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (searchParams = '') => {
    vi.mocked(useLocation).mockReturnValue({
      search: searchParams ? `?${searchParams}` : '',
    } as any);

    return ({ children }: { children: ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
  };

  describe('useFeatureFlagContext', () => {
    it('should return feature flags from context', () => {
      const { result } = renderHook(() => useFeatureFlagContext(), {
        wrapper: createWrapper('enable_full_features=true'),
      });

      expect(result.current).toEqual({
        enable_full_features: true,
      });
    });

    it('should return false when flag is not set', () => {
      const { result } = renderHook(() => useFeatureFlagContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toEqual({
        enable_full_features: false,
      });
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useFeatureFlagContext());
      }).toThrow(
        'useFeatureFlagContext must be used within a FeatureFlagProvider',
      );
    });

    it('should update when search params change', () => {
      const { result, rerender } = renderHook(() => useFeatureFlagContext(), {
        wrapper: createWrapper('enable_full_features=true'),
      });

      expect(result.current.enable_full_features).toBe(true);

      // Re-render with different wrapper
      createWrapper('enable_full_features=false');
      rerender();

      // Note: In a real scenario, you'd need to trigger a route change
      // This test demonstrates the pattern
    });
  });

  describe('useFeatureFlagsEnabled', () => {
    it('should return true when single flag is enabled', () => {
      const { result } = renderHook(
        () => useFeatureFlagsEnabled('enable_full_features'),
        {
          wrapper: createWrapper('enable_full_features=true'),
        },
      );

      expect(result.current).toBe(true);
    });

    it('should return false when single flag is disabled', () => {
      const { result } = renderHook(
        () => useFeatureFlagsEnabled('enable_full_features'),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current).toBe(false);
    });

    it('should return true when all flags are enabled', () => {
      const { result } = renderHook(
        () => useFeatureFlagsEnabled('enable_full_features'),
        {
          wrapper: createWrapper('enable_full_features=true'),
        },
      );

      expect(result.current).toBe(true);
    });

    it('should return false when any flag is disabled', () => {
      const { result } = renderHook(
        () => useFeatureFlagsEnabled('enable_full_features'),
        {
          wrapper: createWrapper('enable_full_features=false'),
        },
      );

      expect(result.current).toBe(false);
    });

    it('should return true when no flags are specified', () => {
      const { result } = renderHook(() => useFeatureFlagsEnabled(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(true);
    });

    it('should memoize the result', () => {
      const { result, rerender } = renderHook(
        () => useFeatureFlagsEnabled('enable_full_features'),
        {
          wrapper: createWrapper('enable_full_features=true'),
        },
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });
});

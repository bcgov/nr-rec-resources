import {
  FeatureFlagProvider,
  useFeatureFlagContext,
} from '@/contexts/feature-flags';
import { render, screen } from '@testing-library/react';
import { useLocation } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

describe('FeatureFlagContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FeatureFlagProvider', () => {
    it('should provide feature flags based on search params', () => {
      vi.mocked(useLocation).mockReturnValue({
        search: '?enable_full_features=true',
      } as any);

      function TestComponent() {
        const flags = useFeatureFlagContext();
        return (
          <div>
            <div>
              enable_full_features: {String(flags.enable_full_features)}
            </div>
          </div>
        );
      }

      render(
        <FeatureFlagProvider>
          <TestComponent />
        </FeatureFlagProvider>,
      );

      expect(
        screen.getByText('enable_full_features: true'),
      ).toBeInTheDocument();
    });

    it('should default enable_full_features to false when not in params', () => {
      vi.mocked(useLocation).mockReturnValue({
        search: '',
      } as any);

      function TestComponent() {
        const flags = useFeatureFlagContext();
        return (
          <div>
            <div>
              enable_full_features: {String(flags.enable_full_features)}
            </div>
          </div>
        );
      }

      render(
        <FeatureFlagProvider>
          <TestComponent />
        </FeatureFlagProvider>,
      );

      expect(
        screen.getByText('enable_full_features: false'),
      ).toBeInTheDocument();
    });

    it('should default enable_full_features to false when param value is not "true"', () => {
      vi.mocked(useLocation).mockReturnValue({
        search: '?enable_full_features=false',
      } as any);

      function TestComponent() {
        const flags = useFeatureFlagContext();
        return (
          <div>
            <div>
              enable_full_features: {String(flags.enable_full_features)}
            </div>
          </div>
        );
      }

      render(
        <FeatureFlagProvider>
          <TestComponent />
        </FeatureFlagProvider>,
      );

      expect(
        screen.getByText('enable_full_features: false'),
      ).toBeInTheDocument();
    });
  });

  describe('useFeatureFlagContext', () => {
    it('should throw error when used outside FeatureFlagProvider', () => {
      function TestComponent() {
        useFeatureFlagContext();
        return <div>Test</div>;
      }

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestComponent />);
      }).toThrow(
        'useFeatureFlagContext must be used within a FeatureFlagProvider',
      );

      console.error = originalError;
    });
  });
});

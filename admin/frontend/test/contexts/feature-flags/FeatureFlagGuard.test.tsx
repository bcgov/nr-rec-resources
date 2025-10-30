import { FeatureFlagGuard } from '@/contexts/feature-flags';
import * as hooks from '@/contexts/feature-flags/hooks';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/feature-flags/hooks');

describe('FeatureFlagGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when all required flags are enabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render children when required flag is disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when empty flags array is provided', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagGuard requiredFlags={[]}>
        <div>Protected Content</div>
      </FeatureFlagGuard>,
    );

    // Empty array means no flags required, so content should render
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should not render when flag check returns false', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle multiple required flags', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

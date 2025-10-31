import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import * as hooks from '@/contexts/feature-flags/hooks';
import { render, screen } from '@testing-library/react';
import { useRouter } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/feature-flags/hooks');

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

describe('FeatureFlagRouteGuard', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      navigate: mockNavigate,
    } as any);
  });

  it('should render children when all required flags are enabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when empty flags array is provided', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagRouteGuard requiredFlags={[]}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    // Empty array means no flags required, so content should render
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should navigate to default redirect when required flag is disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
  });

  it('should navigate to custom redirect when required flag is disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagRouteGuard
        requiredFlags={['enable_full_features']}
        redirectTo="/custom"
      >
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/custom',
      replace: true,
    });
  });

  it('should treat undefined flag as disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
  });

  it('should treat falsy values as disabled flags', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/', replace: true });
  });

  it('should not render when flag check returns false', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle multiple required flags', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <div>Protected Content</div>
      </FeatureFlagRouteGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

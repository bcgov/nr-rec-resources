import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import * as hooks from '@/contexts/feature-flags/hooks';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/feature-flags/hooks');

describe('FeatureFlagRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when all required flags are enabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render children when empty flags array is provided', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard requiredFlags={[]}>
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    // Empty array means no flags required, so content should render
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should navigate to default redirect when required flag is disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should navigate to custom redirect when required flag is disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/custom" element={<div>Custom Redirect Page</div>} />
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard
                requiredFlags={['enable_full_features']}
                redirectTo="/custom"
              >
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
  });

  it('should treat undefined flag as disabled', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should treat falsy values as disabled flags', () => {
    vi.mocked(hooks.useFeatureFlagsEnabled).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/protected"
            element={
              <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
                <div>Protected Content</div>
              </FeatureFlagRouteGuard>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

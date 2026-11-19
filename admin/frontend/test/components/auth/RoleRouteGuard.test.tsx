import { RoleRouteGuard } from '@/components/auth/RoleRouteGuard';
import { createAuthWrapper } from '@test/routes/helpers/roleGuardTestHelper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

describe('RoleRouteGuard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders children when user has the required role', () => {
    render(
      <RoleRouteGuard requireAll={['rst-admin']} redirectTo="/home">
        <div>Protected Route</div>
      </RoleRouteGuard>,
      { wrapper: createAuthWrapper(['rst-admin']) },
    );

    expect(screen.getByText('Protected Route')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects when user lacks the required role', () => {
    render(
      <RoleRouteGuard requireAll={['rst-admin']} redirectTo="/home">
        <div>Protected Route</div>
      </RoleRouteGuard>,
      { wrapper: createAuthWrapper(['rst-viewer']) },
    );

    expect(screen.queryByText('Protected Route')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/home',
      replace: true,
    });
  });

  it('supports combined requireAll and requireAny checks', () => {
    render(
      <RoleRouteGuard
        requireAll={['rst-developer']}
        requireAny={['rst-viewer', 'rst-admin']}
        redirectTo="/home"
      >
        <div>Protected Route</div>
      </RoleRouteGuard>,
      { wrapper: createAuthWrapper(['rst-viewer', 'rst-developer']) },
    );

    expect(screen.getByText('Protected Route')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

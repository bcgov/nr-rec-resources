import { AuthGuard } from '@/components/auth';
import { useAuthContext } from '@/contexts/AuthContext';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useAuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

const baseMock = {
  isLoading: false,
  isAuthenticated: false,
  isAuthorized: false,
  error: null,
  user: undefined,
  authService: {
    getUserFullName: () => 'Test User',
    logout: vi.fn(),
  },
};

describe('AuthGuard', () => {
  it('renders spinner when loading', () => {
    (useAuthContext as any).mockReturnValue({
      ...baseMock,
      isLoading: true,
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    expect(document.querySelector('.spinner-border')).not.toBeNull();
  });

  it('renders error message when error exists', () => {
    (useAuthContext as any).mockReturnValue({
      ...baseMock,
      error: { getMessage: () => 'Auth failed' },
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    expect(screen.getByText('Authentication error')).not.toBeNull();
    expect(screen.getByText('Auth failed')).not.toBeNull();
  });

  it('renders LoginPage when not authenticated', () => {
    (useAuthContext as any).mockReturnValue({
      ...baseMock,
      isAuthenticated: false,
      isAuthorized: false,
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    // LoginPage should be rendered, not the protected content
    expect(screen.queryByText('Protected Content')).toBeNull();
    // Check for LoginPage content
    expect(screen.getByText('Welcome to RecSpace')).not.toBeNull();
  });

  it('renders UnauthorizedPage when authenticated but not authorized', () => {
    (useAuthContext as any).mockReturnValue({
      ...baseMock,
      isAuthenticated: true,
      isAuthorized: false,
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    // UnauthorizedPage should be rendered, not the protected content
    expect(screen.queryByText('Protected Content')).toBeNull();
    // Check for UnauthorizedPage content
    expect(
      screen.getByText('You are not authorized to log in yet'),
    ).not.toBeNull();
  });

  it('renders children when authenticated and authorized', () => {
    (useAuthContext as any).mockReturnValue({
      ...baseMock,
      isAuthenticated: true,
      isAuthorized: true,
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    expect(screen.getByText('Protected Content')).not.toBeNull();
  });
});

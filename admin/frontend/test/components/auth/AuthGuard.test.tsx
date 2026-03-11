import { AuthGuard } from '@/components/auth';
import { useAuthContext } from '@/contexts/AuthContext';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({ useAuthContext: vi.fn() }));

const authService = {
  getUserFullName: () => 'Test User',
  logout: vi.fn(),
  login: vi.fn(),
};

const defaultContext = {
  isLoading: false,
  isAuthenticated: false,
  isAuthorized: false,
  error: null as { getMessage: () => string } | null,
  user: undefined,
  authService,
};

function renderWithContext(overrides: Partial<typeof defaultContext> = {}) {
  (useAuthContext as ReturnType<typeof vi.fn>).mockReturnValue({
    ...defaultContext,
    ...overrides,
  });
  return render(
    <AuthGuard>
      <div>Protected Content</div>
    </AuthGuard>,
  );
}

describe('AuthGuard', () => {
  it('shows spinner when loading', () => {
    renderWithContext({ isLoading: true });
    expect(document.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('shows error message and Log in again calls authService.login', () => {
    const login = vi.fn();
    renderWithContext({
      error: { getMessage: () => 'Auth failed' },
      authService: { ...authService, login },
    });
    expect(screen.getByText('Authentication error')).toBeInTheDocument();
    expect(screen.getByText('Auth failed')).toBeInTheDocument();
    screen.getByRole('button', { name: /log in again/i }).click();
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('renders LoginPage when not authenticated', () => {
    renderWithContext({ isAuthenticated: false, isAuthorized: false });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Welcome to RecSpace')).toBeInTheDocument();
  });

  it('renders UnauthorizedPage when authenticated but not authorized', () => {
    renderWithContext({ isAuthenticated: true, isAuthorized: false });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(
      screen.getByText('You are not authorized to log in yet'),
    ).toBeInTheDocument();
  });

  it('renders children when authenticated and authorized', () => {
    renderWithContext({ isAuthenticated: true, isAuthorized: true });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

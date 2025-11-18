import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthenticationError } from '@/errors/authentication-error/AuthenticationError';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { AuthServiceEvent } from '@/services/auth/AuthService.constants';

// Properly mock AuthService
const authServiceMock = {
  init: vi.fn().mockResolvedValue(true),
  getUser: vi.fn().mockResolvedValue({ name: 'Test User' }),
  isAuthorized: vi.fn().mockReturnValue(true),
  keycloakInstance: {} as any,
};

vi.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: () => authServiceMock,
  },
}));

function TestComponent() {
  const { user, isAuthenticated, isLoading, error } = useAuthContext();
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <span data-testid="is-auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="is-loading">{isLoading ? 'yes' : 'no'}</span>
      <span data-testid="error">{error ? error.message : 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset mock implementations for each test
    authServiceMock.init.mockResolvedValue(true);
    authServiceMock.getUser.mockResolvedValue({ name: 'Test User' });
    authServiceMock.isAuthorized.mockReturnValue(true);
    authServiceMock.keycloakInstance = {};
  });

  it('provides default context values and renders children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Wait for initialization to complete and user to be set
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('no');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('yes');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('no');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('handles logout event', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Wait for initialization to finish first
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('no');
    });

    await act(async () => {
      window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_LOGOUT));
      await Promise.resolve();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('no');
  });

  it('handles auth error event', async () => {
    const parseSpy = vi
      .spyOn(AuthenticationError, 'parse')
      .mockReturnValueOnce({
        message: 'Auth error',
      } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Ensure initialization finished so handler will run
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('no');
    });

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(AuthServiceEvent.AUTH_ERROR, { detail: 'err' }),
      );
      await Promise.resolve();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Auth error');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('no');

    parseSpy.mockRestore();
  });

  it('handles init throwing error', async () => {
    authServiceMock.init.mockRejectedValueOnce('fail');
    const parseSpy = vi
      .spyOn(AuthenticationError, 'parse')
      .mockReturnValueOnce({
        message: 'fail',
      } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('fail');
    });

    parseSpy.mockRestore();
  });

  it('throws if useAuthContext is used outside provider', () => {
    const ThrowComponent = () => {
      useAuthContext();
      return null;
    };
    expect(() => render(<ThrowComponent />)).toThrow();
  });
});

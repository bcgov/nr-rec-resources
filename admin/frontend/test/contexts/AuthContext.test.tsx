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
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow the provider init IIFE to run
      await Promise.resolve();
    });

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
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow the provider init IIFE to run
      await Promise.resolve();
    });

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

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow the provider init IIFE to run
      await Promise.resolve();
    });

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

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow the provider init IIFE to run
      await Promise.resolve();
    });

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

  it('clears timeout on unmount', async () => {
    // Spy on setTimeout to capture the timer id and callback
    let capturedId: any = null;
    const setSpy = vi
      .spyOn(globalThis as any, 'setTimeout')
      .mockImplementation((..._args: any[]) => {
        capturedId = 4242;
        // don't call cb
        return capturedId as any;
      });

    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');

    authServiceMock.init.mockResolvedValueOnce(false);

    let unmount: () => void;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      unmount = result.unmount;
      // allow the provider init IIFE to run
      await Promise.resolve();
    });
    expect(setSpy).toHaveBeenCalled();

    // Unmount before the timeout fires - cleanup should call clearTimeout with the captured id
    await act(async () => {
      unmount();
      await Promise.resolve();
    });

    expect(clearSpy).toHaveBeenCalledWith(capturedId);

    setSpy.mockRestore();
    clearSpy.mockRestore();
  }, 30000);

  it('handles AUTH_SUCCESS event and sets authenticated user', async () => {
    // start with init resolving false so we wait for event
    authServiceMock.init.mockResolvedValueOnce(false);
    // ensure getUser returns our user
    authServiceMock.getUser.mockResolvedValueOnce({ name: 'Event User' });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow the provider init IIFE to run
      await Promise.resolve();
    });

    // Dispatch AUTH_SUCCESS event which should trigger setAuthenticatedUser
    await act(async () => {
      window.dispatchEvent(new CustomEvent(AuthServiceEvent.AUTH_SUCCESS));
      // allow any microtasks to resolve
      await Promise.resolve();
    });

    // Now the user should be set from getUser
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Event User');
    });
  }, 30000);

  // New test to cover setUnauthenticatedUser via scheduled timeout
  it('marks unauthenticated when the auth success timeout fires', async () => {
    let scheduledCb: ((...args: any[]) => void) | null = null;
    const setSpy = vi
      .spyOn(globalThis as any, 'setTimeout')
      .mockImplementation((...args: any[]) => {
        const cb = args[0];
        scheduledCb = cb as (...args: any[]) => void;
        return 999 as any;
      });

    // Make init return false so the provider schedules the unauthenticated timeout
    authServiceMock.init.mockResolvedValueOnce(false);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
      // allow provider init to run
      await Promise.resolve();
    });

    expect(setSpy).toHaveBeenCalled();

    // Fire the scheduled callback inside act so state updates are wrapped
    if (scheduledCb) {
      await act(async () => {
        (scheduledCb as any)();
        await Promise.resolve();
      });
    }

    // After the callback, the provider should mark the user unauthenticated
    // State updates are flushed by act, so we can assert synchronously
    expect(screen.getByTestId('is-loading').textContent).toBe('no');
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('is-auth').textContent).toBe('no');

    setSpy.mockRestore();
  }, 30000);
});

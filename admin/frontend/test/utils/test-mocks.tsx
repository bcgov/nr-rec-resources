import { vi } from 'vitest';

/**
 * Shared test mocks and utilities for auth-related components
 */

export const createMockAuthContext = (mockLogin = vi.fn()) => ({
  authService: { login: mockLogin },
});

export const MockLoginPanel = ({
  onLogin,
  className,
  buttonText,
}: {
  onLogin: () => void;
  className?: string;
  buttonText?: string;
}) => (
  <div data-testid={`login-panel-${className || 'default'}`}>
    <button onClick={onLogin}>{buttonText ?? 'Login'}</button>
  </div>
);

export const MockAuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

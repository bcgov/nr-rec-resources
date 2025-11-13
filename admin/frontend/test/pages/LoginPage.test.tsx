import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('@/components/auth/LoginPanel', () => ({
  LoginPanel: ({
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
  ),
}));

vi.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    mockLogin.mockClear();
    (useAuthContext as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      authService: { login: mockLogin },
    }));
  });

  it('renders informational content and two LoginPanel instances', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome to RecSpace/)).toBeInTheDocument();
    // two mocked login panels (one mobile, one desktop)
    expect(screen.getByTestId('login-panel-d-lg-none')).toBeInTheDocument();
    expect(
      screen.getByTestId('login-panel-d-none d-lg-flex'),
    ).toBeInTheDocument();
  });

  it('calls authService.login when LoginPanel button is clicked', () => {
    render(<LoginPage />);

    const loginButtons = screen.getAllByRole('button', { name: /Login/i });
    fireEvent.click(loginButtons[0]);

    expect(mockLogin).toHaveBeenCalledWith('/'); // default ROUTE_PATHS.LANDING is '/'
    expect(mockLogin).toHaveBeenCalledOnce();
  });
});

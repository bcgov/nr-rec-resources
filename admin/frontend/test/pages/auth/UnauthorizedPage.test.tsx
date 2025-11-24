import { CONTACT } from '@/constants/contact';
import { useAuthContext } from '@/contexts/AuthContext';
import { UnauthorizedPage } from '@/pages/auth';
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

describe('UnauthorizedPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    mockLogin.mockClear();
    (useAuthContext as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      authService: { login: mockLogin },
    }));
  });

  it('renders unauthorized messaging and email links', () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByText(/You are not authorized to log in yet/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(CONTACT.SUPPORT_EMAIL).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('calls authService.login when LoginPanel button clicked', () => {
    render(<UnauthorizedPage />);
    const loginButtons = screen.getAllByRole('button', { name: /Login/i });
    fireEvent.click(loginButtons[0]);
    expect(mockLogin).toHaveBeenCalledOnce();
  });
});

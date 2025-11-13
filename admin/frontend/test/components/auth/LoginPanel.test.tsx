import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoginPanel } from '@/components/auth/LoginPanel';

describe('LoginPanel', () => {
  it('renders title, subtitle and button with default text', () => {
    const onLogin = vi.fn();
    render(<LoginPanel onLogin={onLogin} />);

    // Heading should be present
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(
      screen.getByText('Use your IDIR to access the Staff Portal'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('applies custom className and buttonText and calls onLogin when clicked', () => {
    const onLogin = vi.fn();
    render(
      <LoginPanel
        onLogin={onLogin}
        className="custom-class"
        buttonText="Sign in"
      />,
    );

    const root = screen
      .getByRole('heading', { name: /Login/i })
      .closest('.login-panel');
    expect(root).toHaveClass('custom-class');

    const button = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(button);
    expect(onLogin).toHaveBeenCalledOnce();
  });
});

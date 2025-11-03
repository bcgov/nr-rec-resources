import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/header/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

import { AuthLayout } from '@/components/auth/AuthLayout';

describe('AuthLayout', () => {
  it('renders Header and children', () => {
    render(
      <AuthLayout>
        <div>child-content</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('child-content')).toBeInTheDocument();
  });
});

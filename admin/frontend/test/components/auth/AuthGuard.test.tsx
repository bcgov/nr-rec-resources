import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthContext } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth';

// Mock useAuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

describe('AuthGuard', () => {
  it('renders spinner when loading', () => {
    (useAuthContext as any).mockReturnValue({
      isLoading: true,
      error: null,
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
      isLoading: false,
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

  it('renders children when not loading and no error', () => {
    (useAuthContext as any).mockReturnValue({
      isLoading: false,
      error: null,
    });
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    );
    expect(screen.getByText('Protected Content')).not.toBeNull();
  });
});

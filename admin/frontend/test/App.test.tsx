import App from '@/App';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/useGlobalQueryErrorHandler', () => ({
  useGlobalQueryErrorHandler: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuthContext: vi.fn(() => ({
    isLoading: false,
    error: null,
    user: { given_name: 'Test', family_name: 'User' },
  })),
}));

vi.mock('@/services/auth/AuthService', () => ({
  AuthService: {
    getInstance: vi.fn(() => ({
      init: vi.fn().mockResolvedValue(true),
      getUser: vi.fn(() => ({ given_name: 'Test', family_name: 'User' })),
      getUserFullName: vi.fn(() => 'Test User'),
      authenticated: true,
    })),
  },
}));

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: ({ initialIsOpen }: { initialIsOpen: boolean }) => (
    <div data-testid="devtools" data-initial-open={initialIsOpen.toString()} />
  ),
}));

vi.mock('@/components', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
  Header: () => <header data-testid="header">Header</header>,
  NotificationBar: () => (
    <div data-testid="notification-bar">NotificationBar</div>
  ),
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-router');
  return {
    ...actual,
    RouterProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

vi.mock('@/pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/pages/rec-resource-page/RecResourcePage', () => ({
  RecResourcePage: () => (
    <div data-testid="rec-resource-page">Rec Resource Page</div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main app structure and provider chain without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('devtools')).toHaveAttribute(
      'data-initial-open',
      'false',
    );
  });
});

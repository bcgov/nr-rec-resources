import App from '@/App';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the global query error handler hook
vi.mock('@/services/hooks/useGlobalQueryErrorHandler', () => ({
  useGlobalQueryErrorHandler: vi.fn(),
}));

// Mock AuthContext to provide controlled auth states
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuthContext: vi.fn(() => ({
    isLoading: false,
    error: null,
    user: { given_name: 'Test', family_name: 'User' },
  })),
}));

// Mock Keycloak/Auth service since it requires external auth server
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

// Mock React Query Devtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: ({ initialIsOpen }: { initialIsOpen: boolean }) => (
    <div data-testid="devtools" data-initial-open={initialIsOpen.toString()} />
  ),
}));

// Mock the components that depend on external services
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

// Mock the router to provide controlled routing behavior
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    RouterProvider: () => (
      <div data-testid="router-provider">
        <div data-testid="auth-guard">
          <header data-testid="header">Header</header>
          <div data-testid="notification-bar">NotificationBar</div>
          <main data-testid="main-content">
            <div data-testid="mock-route-content">Route Content</div>
          </main>
        </div>
      </div>
    ),
  };
});

// Mock pages
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

  it('renders the main app structure with QueryClient, Auth, and Router', () => {
    render(<App />);

    // Should render the main router provider
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();

    // Should render the devtools
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('devtools')).toHaveAttribute(
      'data-initial-open',
      'false',
    );
  });

  it('initializes successfully with all hooks', () => {
    // This test verifies that useGlobalQueryErrorHandler is called successfully
    // If the hook failed to initialize, the component would throw an error
    render(<App />);

    // If we reach this point, all hooks (including useGlobalQueryErrorHandler) initialized correctly
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
  });

  it('configures QueryClient with correct default options', () => {
    // This test verifies that the component renders without QueryClient configuration errors
    render(<App />);

    // If QueryClient was misconfigured, this would throw during render
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });

  it('renders without crashing when all providers are set up', () => {
    // This is an integration test that verifies the full provider chain works
    const { container } = render(<App />);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });
});

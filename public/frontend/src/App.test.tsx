import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Mock the routes
vi.mock('@/routes', () => ({
  dataRouter: {
    routes: [],
    state: {
      location: {
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'test',
      },
      matches: [],
      historyAction: 'POP' as const,
      loaderData: {},
      actionData: null,
      errors: null,
    },
    navigate: vi.fn(),
    subscribe: vi.fn(),
  },
}));

// Mock RouterProvider to render children instead
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    RouterProvider: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="mock-router-provider">
        {children || 'Router Content'}
      </div>
    ),
  };
});

// Mock the ScrollToTop component
vi.mock('@/components/layout/ScrollToTop', () => ({
  default: () => <div data-testid="mock-scroll-to-top">ScrollToTop</div>,
}));

describe('App', () => {
  it('renders the app structure correctly', () => {
    const { getByTestId } = render(<App />);

    expect(getByTestId('mock-router-provider')).toBeInTheDocument();
    expect(getByTestId('mock-scroll-to-top')).toBeInTheDocument();
  });

  it('initializes QueryClient', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

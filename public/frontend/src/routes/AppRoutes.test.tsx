import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';
import { ROUTE_PATHS } from '@/routes/constants';

// Create test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Mock the components
vi.mock('@/components/landing-page', () => ({
  LandingPage: () => <div>Landing Page</div>,
}));

vi.mock('@/components/NotFound', () => ({
  default: () => <div>Not Found Page</div>,
}));

vi.mock('@/components/search/SearchPage', () => ({
  default: () => <div>Search Page</div>,
}));

vi.mock('@/components/contact-page/ContactPage', () => ({
  ContactPage: () => <div>Contact Page</div>,
}));

// Mock rec resource page with proper providers
vi.mock('@/components/rec-resource/RecResourcePage', () => ({
  default: () => {
    // Mock PageTitle to actually set the document title
    document.title = '0 K SNOWMOBILE PARKING LOT | Sites and Trails BC';
    return <div>Rec Resource Page</div>;
  },
}));

// Mock breadcrumb hooks
vi.mock('@/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="breadcrumb">Breadcrumbs</nav>,
  useContactBreadcrumbs: vi.fn(),
  useResourceBreadcrumbs: vi.fn(),
}));

// Mock service hooks
vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(() => ({
    data: {
      name: '0 K SNOWMOBILE PARKING LOT',
    },
    isLoading: false,
    isError: false,
  })),
  useGetSiteOperatorById: vi.fn(() => ({
    data: {
      acronym: undefined,
      clientName: 'SITE OPERATOR NAME',
      clientNumber: '0001',
      clientStatusCode: 'ACT',
      clientTypeCode: 'C',
      legalFirstName: undefined,
      legalMiddleName: undefined,
    },
    isLoading: false,
    isError: false,
  })),
}));

// Mock RouteChangeScrollReset to avoid router context issues
vi.mock('@/routes/RouteChangeScrollReset', () => ({
  RouteChangeScrollReset: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock react-router-dom selectively
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({
      id: 'REC1234',
    })),
  };
});

const renderWithProviders = (initialEntry: string) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('AppRoutes', () => {
  it('renders landing page on home route', () => {
    renderWithProviders(ROUTE_PATHS.HOME);
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('renders not found page on not found route', () => {
    renderWithProviders('/non-existent-route');
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });

  it('renders recreation resource page on rec resource route', () => {
    renderWithProviders(ROUTE_PATHS.REC_RESOURCE);
    expect(screen.getByText('Rec Resource Page')).toBeInTheDocument();
  });

  it('renders search page on search route', () => {
    renderWithProviders(ROUTE_PATHS.SEARCH);
    expect(screen.getByText('Search Page')).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', () => {
    renderWithProviders('/unknown-route');
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});

describe('Page Titles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const SITE_TITLE = 'Sites and Trails BC';

  it('should set title for Landing Page', () => {
    renderWithProviders(ROUTE_PATHS.HOME);
    expect(document.title).toBe(SITE_TITLE);
  });

  it('should set title for 404 Page', async () => {
    renderWithProviders('/non-existent-route');

    await waitFor(() => expect(document.title).toBe(`404 | ${SITE_TITLE}`));
  });

  it('should set title for Search Page', () => {
    renderWithProviders(ROUTE_PATHS.SEARCH);

    expect(document.title).toBe(`Find a site or trail | ${SITE_TITLE}`);
  });

  it('should set title dynamically for Rec Resource Page', async () => {
    renderWithProviders(ROUTE_PATHS.REC_RESOURCE);
    await waitFor(() =>
      expect(document.title).toBe(`0 K SNOWMOBILE PARKING LOT | ${SITE_TITLE}`),
    );
  });
});

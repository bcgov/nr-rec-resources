import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { ROUTE_PATHS } from '@/routes/constants';

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

// Mock actual rec resource page to test dynamic title
vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(() => ({
    data: {
      name: '0 K SNOWMOBILE PARKING LOT',
    },
  })),
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(() => ({
    id: 'REC1234',
  })),
}));

const renderWithRouter = (initialEntry: string) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>,
  );
};

describe('AppRoutes', () => {
  it('renders landing page on home route', () => {
    renderWithRouter(ROUTE_PATHS.HOME);
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('renders not found page on not found route', () => {
    renderWithRouter('/non-existent-route');
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });

  it('renders recreation resource page on rec resource route', () => {
    renderWithRouter(ROUTE_PATHS.REC_RESOURCE);
    expect(screen.getByText('0 K Snowmobile Parking Lot')).toBeInTheDocument();
  });

  it('renders search page on search route', () => {
    renderWithRouter(ROUTE_PATHS.SEARCH);
    expect(screen.getByText('Search Page')).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', () => {
    renderWithRouter('/unknown-route');
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});

describe('Page Titles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const SITE_TITLE = 'Find a site or trail';

  it('should set title for Landing Page', () => {
    renderWithRouter(ROUTE_PATHS.HOME);
    expect(document.title).toBe(SITE_TITLE);
  });

  it('should set title for 404 Page', async () => {
    renderWithRouter('/non-existent-route');

    await waitFor(() => expect(document.title).toBe(`404 | ${SITE_TITLE}`));
  });

  it('should set title for Search Page', () => {
    renderWithRouter(ROUTE_PATHS.SEARCH);

    expect(document.title).toBe(`Find a site or trail | ${SITE_TITLE}`);
  });

  it('should set title dynamically for Rec Resource Page', () => {
    renderWithRouter(ROUTE_PATHS.REC_RESOURCE);
    expect(document.title).toBe(`0 K Snowmobile Parking Lot | ${SITE_TITLE}`);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

vi.mock('@/components/rec-resource/RecResourcePage', () => ({
  default: () => <div>Rec Resource Page</div>,
}));

vi.mock('@/components/search/SearchPage', () => ({
  default: () => <div>Search Page</div>,
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
    expect(screen.getByText('Rec Resource Page')).toBeInTheDocument();
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

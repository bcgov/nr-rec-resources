import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchBanner from './SearchBanner';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

const queryClient = new QueryClient();

describe('SearchBanner', () => {
  let searchParams: any;
  let setSearchParams: any;

  beforeEach(() => {
    searchParams = new URLSearchParams();
    setSearchParams = vi.fn();
    (useSearchParams as any).mockReturnValue([searchParams, setSearchParams]);
  });

  it('renders correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SearchBanner />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByLabelText('Search by name or community'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});

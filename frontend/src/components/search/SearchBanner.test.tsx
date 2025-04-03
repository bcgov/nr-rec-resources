import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import SearchBanner from './SearchBanner';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

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
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>,
    );
    expect(
      screen.getByPlaceholderText('Search by name or community'),
    ).toBeInTheDocument();
    expect(screen.getByText('Find a site or trail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});

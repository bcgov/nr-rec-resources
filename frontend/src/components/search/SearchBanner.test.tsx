import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
      screen.getByPlaceholderText('Search by name or closest community'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Find a recreation site or trail'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>,
    );
    const input: any = screen.getByPlaceholderText(
      'Search by name or closest community',
    );
    fireEvent.change(input, { target: { value: 'Hiking Trail' } });
    expect(input.value).toBe('Hiking Trail');
  });

  it('triggers search on button click', () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>,
    );
    const input = screen.getByPlaceholderText(
      'Search by name or closest community',
    );
    fireEvent.change(input, { target: { value: 'Mountain' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
  });

  it('triggers search on Enter key press', () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>,
    );
    const input = screen.getByPlaceholderText(
      'Search by name or closest community',
    );
    fireEvent.change(input, { target: { value: 'Lake' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
  });

  it('clears input and search params on clear button click', () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>,
    );
    const input: any = screen.getByPlaceholderText(
      'Search by name or closest community',
    );
    fireEvent.change(input, { target: { value: 'Forest' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input.value).toBe('');
    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
  });
});

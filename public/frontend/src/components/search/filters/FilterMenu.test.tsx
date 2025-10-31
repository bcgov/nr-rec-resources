import { render, screen } from '@testing-library/react';
import FilterMenu from '@/components/search/filters/FilterMenu';
import searchResultsStore from '@/store/searchResults';
import { mockFilterMenuContent } from '@/components/search/test/mock-data';
import { describe, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useSearch: vi.fn().mockReturnValue({}),
  };
});

Object.defineProperty(searchResultsStore, 'state', {
  get: vi.fn(() => ({
    totalCount: 12,
    filters: mockFilterMenuContent,
  })),
});

describe('FilterMenu', () => {
  it('renders FilterMenu component', () => {
    render(<FilterMenu />);

    // Renders titles
    expect(screen.getByText('Filter')).toBeVisible();
    expect(screen.getByText('Activities')).toBeVisible();
    expect(screen.getByText('Status')).toBeVisible();

    // Renders filter labels with count
    expect(screen.getByText('Snowmobiling (9)')).toBeVisible();
    expect(screen.getByText('Angling (14)')).toBeVisible();
    expect(screen.getByText('Canoeing (5)')).toBeVisible();
    expect(screen.getByText('Camping (12)')).toBeVisible();
    expect(screen.getByText('Open (8)')).toBeVisible();
    expect(screen.getByText('Closed (5)')).toBeVisible();

    // Renders checkboxes
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
  });
});

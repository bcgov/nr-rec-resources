import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as recreationResourceQueries from '@/service/queries/recreation-resource';
import SearchPage from './SearchPage';
import searchResultsStore from '@/store/searchResults';
import { mockFilterMenuContent } from '@/components/search/test/mock-data';

const mockData = {
  pages: [
    {
      data: [
        {
          rec_resource_id: '1',
          title: 'Test Resource',
        },
      ],
      filters: [],
      currentPage: 1,
      totalCount: 1,
    },
  ],
  totalCount: 1,
  filters: mockFilterMenuContent,
};

vi.mock('@/service/queries/recreation-resource');
vi.mock('@/components/rec-resource/card/RecResourceCard', () => ({
  default: vi.fn(() => <div data-testid="mock-resource-card" />),
}));

describe('SearchPage', () => {
  const mockQueryResult = {
    data: mockData,
    fetchNextPage: vi.fn(),
    fetchPreviousPage: vi.fn(),
    hasNextPage: true,
    hasPreviousPage: false,
  };

  beforeEach(() => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult as any);
  });

  it('displays correct singular/plural results text', () => {
    // Test singular case
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValueOnce({
      ...mockQueryResult,
      data: { ...mockData, totalCount: 1 },
    } as any);

    vi.spyOn(searchResultsStore, 'subscribe').mockReturnValueOnce(() => ({
      state: {
        ...mockData,
      },
    }));

    const { rerender } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);

    // Test plural case
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValueOnce({
      ...mockQueryResult,
      data: { ...mockData, totalCount: 2 },
    } as any);

    vi.spyOn(searchResultsStore, 'subscribe').mockReturnValueOnce(() => ({
      state: {
        ...mockData,
        totalCount: 2,
      },
    }));

    rerender(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);
  });

  it('handles load more button click', () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    expect(mockQueryResult.fetchNextPage).toHaveBeenCalled();
  });

  it('handles mobile filter menu', () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    const filterButton = screen.getByLabelText('Open mobile filter menu');
    fireEvent.click(filterButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays no results message when data is empty', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      data: { ...mockData, totalCount: 0, pages: [{ data: [], filters: [] }] },
    } as any);

    vi.spyOn(searchResultsStore, 'subscribe').mockReturnValueOnce(() => ({
      state: {
        pages: [{ data: [], filters: [] }],
        totalCount: 0,
      },
    }));

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('handles load previous button click', () => {
    const mockQueryResultWithPrevious = {
      ...mockQueryResult,
      hasPreviousPage: true,
    };

    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResultWithPrevious as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    const loadPreviousButton = screen.getByText('Load Previous');
    fireEvent.click(loadPreviousButton);

    expect(mockQueryResultWithPrevious.fetchPreviousPage).toHaveBeenCalled();
  });

  it('handles null or undefined data gracefully', () => {
    // Test case 1: undefined data
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      data: undefined,
    } as any);

    vi.spyOn(searchResultsStore, 'subscribe').mockReturnValueOnce(() => ({
      state: undefined,
    }));

    const { rerender } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();

    // Test case 2: data with undefined pages
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      data: { pages: undefined, totalCount: undefined },
    } as any);

    rerender(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should display the progress bar when fetching data', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      isFetching: true,
    } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not display the progress bar when not fetching data', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should display "Loading..." text when fetching data', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      isFetching: true,
    } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should not display "Loading..." text when not fetching data', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue({
      ...mockQueryResult,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });
});

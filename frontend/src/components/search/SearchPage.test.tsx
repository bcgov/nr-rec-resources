import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import searchResultsStore from '@/store/searchResults';
import * as recreationResourceQueries from '@/service/queries/recreation-resource';
import SearchPage from './SearchPage';
import { mockSearchResultsData } from '@/components/search/test/mock-data';

vi.mock('@/service/queries/recreation-resource');
vi.mock('@/components/rec-resource/card/RecResourceCard', () => ({
  default: vi.fn(() => <div data-testid="mock-resource-card" />),
}));

vi.mock('@/store/searchResults', async () => ({
  default: {
    state: {
      currentPage: 1,
      filters: [],
      totalCount: 0,
      pages: [],
      pageParams: [],
    },
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('SearchPage', () => {
  const mockQueryResult = {
    data: mockSearchResultsData,
    fetchNextPage: vi.fn().mockResolvedValue({}),
    fetchPreviousPage: vi.fn(),
    hasNextPage: true,
    hasPreviousPage: false,
  };

  beforeEach(() => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult as any);
    vi.clearAllMocks();
  });

  it('displays correct singular/plural results text', async () => {
    // Test singular case
    const mockSingleResultData = {
      ...mockSearchResultsData,
      totalCount: 1,
      pages: [
        {
          ...mockSearchResultsData.pages[0],
          data: [mockSearchResultsData.pages[0].data[0]],
        },
      ],
    };

    searchResultsStore.state = { ...mockSingleResultData, totalCount: 1 };

    const { rerender } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Result containing')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);

    searchResultsStore.state = { ...mockSearchResultsData, totalCount: 2 };

    rerender(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Results containing')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(2);
  });

  it('handles load more button click and scrolls to last item', async () => {
    // Mock DOM elements and scroll behavior
    const mockLastItem = document.createElement('div');
    const mockScrollIntoView = vi.fn();
    mockLastItem.scrollIntoView = mockScrollIntoView;

    vi.spyOn(document, 'querySelector').mockReturnValue({
      lastElementChild: mockLastItem,
    } as unknown as Element);

    vi.useFakeTimers(); // for setTimeout

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    // Fast-forward timers
    await vi.runAllTimersAsync();

    expect(mockQueryResult.fetchNextPage).toHaveBeenCalled();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    vi.useRealTimers();
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
    const mockSearchResults = {
      totalCount: 0,
      pages: [
        {
          filters: [],
          data: [],
        },
      ],
    };

    searchResultsStore.state = mockSearchResults as any;

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('No sites or trails matched your search.'),
    ).toBeInTheDocument();
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

    searchResultsStore.state = mockQueryResultWithPrevious as any;

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
    searchResultsStore.state = { ...mockQueryResult, pages: undefined } as any;

    const { rerender } = render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('No sites or trails matched your search.'),
    ).toBeInTheDocument();

    // Test case 2: data with undefined pages
    searchResultsStore.state = {
      ...mockQueryResult,
      data: { pages: undefined, totalCount: undefined },
    } as any;

    rerender(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('No sites or trails matched your search.'),
    ).toBeInTheDocument();
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

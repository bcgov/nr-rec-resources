import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useSearchParams, useNavigate } from 'react-router-dom';
import searchResultsStore from '@/store/searchResults';
import * as recreationResourceQueries from '@/service/queries/recreation-resource';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchPage from './SearchPage';
import { renderWithQueryClient } from '@/test-utils';
import { mockSearchResultsData } from '@/components/search/test/mock-data';

const queryClient = new QueryClient();

vi.mock('@/service/queries/recreation-resource');
vi.mock('@/components/rec-resource/card/RecResourceCard', () => ({
  default: vi.fn(() => <div data-testid="mock-resource-card" />),
}));

vi.mock('@/components/search/SearchMap/SearchMap', () => ({
  default: vi.fn(() => <div data-testid="mock-search-map" />),
}));

vi.mock(
  '@/components/recreation-suggestion-form/RecreationSuggestionForm',
  () => ({
    default: vi.fn(() => <div data-testid="mock-recreation-suggestion-form" />),
  }),
);

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('@/store/searchResults', async () => ({
  default: {
    state: {
      currentPage: 1,
      filters: [],
      totalCount: 0,
      pages: [],
      pageParams: [],
      extent: undefined,
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

    // Mock hooks to avoid errors
    (useNavigate as Mock).mockReturnValue(vi.fn());
    (useSearchParams as Mock).mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  it('displays correct singular/plural results text', async () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({});

    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

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

    const { rerender } = renderWithQueryClient(<SearchPage />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);

    searchResultsStore.state = { ...mockSearchResultsData, totalCount: 2 };

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(2);
  });

  it('displays "contains" string if the filter is set', async () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({
      filter: 'test',
    });

    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

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

    renderWithQueryClient(<SearchPage />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Result containing')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);
  });

  it('handles load more button click and scrolls to last item', async () => {
    const mockLastItem = document.createElement('div');
    const mockScrollIntoView = vi.fn();
    mockLastItem.scrollIntoView = mockScrollIntoView;

    vi.spyOn(document, 'querySelector').mockReturnValue({
      lastElementChild: mockLastItem,
    } as unknown as Element);

    vi.useFakeTimers();

    renderWithQueryClient(<SearchPage />);

    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    await vi.runAllTimersAsync();

    expect(mockQueryResult.fetchNextPage).toHaveBeenCalled();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    vi.useRealTimers();
  });

  it('handles mobile filter menu', () => {
    renderWithQueryClient(<SearchPage />);

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

    renderWithQueryClient(<SearchPage />);

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

    renderWithQueryClient(<SearchPage />);

    const loadPreviousButton = screen.getByText('Load Previous');
    fireEvent.click(loadPreviousButton);

    expect(mockQueryResultWithPrevious.fetchPreviousPage).toHaveBeenCalled();
  });

  it('handles null or undefined data gracefully', () => {
    // Test case 1: undefined pages
    searchResultsStore.state = { ...mockQueryResult, pages: undefined } as any;

    const { rerender } = renderWithQueryClient(<SearchPage />);

    expect(
      screen.getByText('No sites or trails matched your search.'),
    ).toBeInTheDocument();

    // Test case 2: data with undefined pages and totalCount
    searchResultsStore.state = {
      ...mockQueryResult,
      data: { pages: undefined, totalCount: undefined },
    } as any;

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SearchPage />
        </MemoryRouter>
      </QueryClientProvider>,
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

    renderWithQueryClient(<SearchPage />);

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

    renderWithQueryClient(<SearchPage />);

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

    renderWithQueryClient(<SearchPage />);

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

    renderWithQueryClient(<SearchPage />);

    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });

  it('should display the results count', async () => {
    searchResultsStore.state = {
      ...mockQueryResult,
      totalCount: 5,
    } as any;

    const { container } = renderWithQueryClient(<SearchPage />);

    await waitFor(() => {
      const resultsTextDiv = container.querySelector('.results-text');
      expect(resultsTextDiv).toBeInTheDocument();
      expect(resultsTextDiv?.textContent).toContain('5');
      expect(resultsTextDiv?.textContent).toContain('Results');
    });
  });

  it('should display location in results count when lat, lon, and community are provided', async () => {
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams({
      lat: '48.4284',
      lon: '-123.3656',
      community: 'Victoria',
    });

    (useSearchParams as Mock).mockReturnValue([searchParams, setSearchParams]);

    searchResultsStore.state = {
      ...mockSearchResultsData,
      totalCount: 5,
    } as any;

    const { container } = renderWithQueryClient(<SearchPage />);

    await waitFor(() => {
      const resultsTextDiv = container.querySelector('.results-text');
      expect(resultsTextDiv).toBeInTheDocument();
      expect(resultsTextDiv?.textContent).toContain(
        '5 Results  within 50 km radius of Victoria',
      );
    });
  });

  it('should render the suggestion form', () => {
    renderWithQueryClient(<SearchPage />);

    expect(
      screen.getByTestId('mock-recreation-suggestion-form'),
    ).toBeInTheDocument();
  });
});

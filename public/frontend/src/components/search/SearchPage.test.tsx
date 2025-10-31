import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import searchResultsStore from '@/store/searchResults';
import * as recreationResourceQueries from '@/service/queries/recreation-resource';
import SearchPage from './SearchPage';
import { renderWithQueryClient } from '@/test-utils';
import { mockSearchResultsData } from '@/components/search/test/mock-data';

const mockNavigate = vi.fn();
const mockSearchParams: Record<string, string> = {};

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: vi.fn(() => mockSearchParams),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/service/queries/recreation-resource');
vi.mock('@/components/rec-resource/card/RecResourceCard', () => ({
  default: vi.fn(() => <div data-testid="mock-resource-card" />),
}));
vi.mock('@/components/search-map/SearchMap', () => ({
  default: vi.fn(() => <div data-testid="mock-search-map" />),
}));
vi.mock('@/components/search/filters', () => ({
  FilterChips: vi.fn(() => <div data-testid="mock-filter-chips" />),
  FilterMenu: vi.fn(() => <div data-testid="mock-filter-menu" />),
  FilterMenuMobile: vi.fn(({ isOpen }) =>
    isOpen ? <div role="dialog" data-testid="mock-filter-menu-mobile" /> : null,
  ),
}));
vi.mock('@/components/search', () => ({
  NoResults: vi.fn(() => (
    <div data-testid="mock-no-results">
      No sites or trails matched your search.
    </div>
  )),
  SearchBanner: vi.fn(() => (
    <div data-testid="mock-search-banner">
      <input
        placeholder="By name or community"
        data-testid="mock-search-input"
      />
    </div>
  )),
  SearchMap: vi.fn(() => <div data-testid="mock-search-map" />),
  SearchViewControls: vi.fn(() => (
    <div data-testid="mock-search-view-controls" />
  )),
}));
vi.mock('@/components/search/SearchLinks', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@/components/search/SearchLinksMobile', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@/components/LoadingButton', () => ({
  LoadingButton: vi.fn(
    ({ children, onClick, className, disabled, loading }) => (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        data-loading={loading}
      >
        {children}
      </button>
    ),
  ),
}));
vi.mock('@/components/layout/PageTitle', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@/store/filterChips', () => ({
  default: {
    state: { filterChips: [] },
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));
vi.mock('@/store/searchResults', () => ({
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
vi.mock('@/components/search/hooks/useInitialPageFromSearchParams', () => ({
  useInitialPageFromSearchParams: vi.fn(() => 1),
}));
vi.mock('@/components/search/utils/setFilterChipsFromSearchParams', () => ({
  default: vi.fn(),
}));
vi.mock('@shared/utils', () => ({ trackEvent: vi.fn() }));

describe('SearchPage', () => {
  const mockQueryResult = (overrides = {}) => ({
    data: mockSearchResultsData,
    fetchNextPage: vi.fn().mockResolvedValue({}),
    fetchPreviousPage: vi.fn(),
    hasNextPage: true,
    hasPreviousPage: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    ...overrides,
  });

  const mockStoreState = (state = {}) => {
    searchResultsStore.state = { ...mockSearchResultsData, ...state };
  };

  const setMockSearchParams = (params: Record<string, string> = {}) => {
    Object.keys(mockSearchParams).forEach(
      (key) => delete mockSearchParams[key],
    );
    Object.assign(mockSearchParams, params);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState();
    setMockSearchParams();

    // Mock scroll functionality
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '.search-container section') {
        return { lastElementChild: { scrollIntoView: vi.fn() } } as any;
      }
      return null;
    });

    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult() as any);
  });

  it('renders all main components', () => {
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-banner')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-map')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filter-menu')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Open mobile filter menu'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-view-controls')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filter-chips')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('By name or community'),
    ).toBeInTheDocument();
  });

  it('displays singular result count correctly', () => {
    mockStoreState({
      totalCount: 1,
      pages: [{ data: [mockSearchResultsData.pages[0].data[0]] }],
    });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(1);
  });

  it('displays plural results count correctly', () => {
    mockStoreState({ totalCount: 2 });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('displays filter text when filter is set', () => {
    mockStoreState({ totalCount: 1 });
    setMockSearchParams({ filter: 'test' });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByText('Result containing')).toBeInTheDocument();
    expect(screen.getByText("'test'")).toBeInTheDocument();
  });

  it('displays location context when coordinates provided', async () => {
    mockStoreState({ totalCount: 5 });
    setMockSearchParams({
      lat: '48.4284',
      lon: '-123.3656',
      community: 'Victoria',
    });
    const { container } = renderWithQueryClient(<SearchPage />);
    await waitFor(() => {
      const resultsTextDiv = container.querySelector('.results-text');
      expect(resultsTextDiv?.textContent).toContain(
        '5 Results  within 50 km radius of Victoria',
      );
    });
  });

  it('displays no results when data is empty', () => {
    mockStoreState({ totalCount: 0, pages: [{ filters: [], data: [] }] });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-no-results')).toBeInTheDocument();
  });

  it('handles zero count with data', () => {
    mockStoreState({ totalCount: 0, pages: [{ data: [] }] });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('mock-no-results')).toBeInTheDocument();
  });

  it('handles empty pages array', () => {
    mockStoreState({ totalCount: 0, pages: [] });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-no-results')).toBeInTheDocument();
  });

  it('renders results when data is available', () => {
    mockStoreState({
      totalCount: 2,
      pages: [{ data: mockSearchResultsData.pages[0].data }],
    });
    renderWithQueryClient(<SearchPage />);
    expect(screen.queryByTestId('mock-no-results')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('mock-resource-card')).toHaveLength(2);
  });

  it('shows loading state when fetching first page', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult({ isFetching: true }) as any);
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('does not show progress bar when not fetching', () => {
    renderWithQueryClient(<SearchPage />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });

  it('hides progress bar during next page fetching', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(
      mockQueryResult({ isFetching: true, isFetchingNextPage: true }) as any,
    );
    renderWithQueryClient(<SearchPage />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('handles load more with scroll behavior', async () => {
    const queryResult = mockQueryResult();
    const mockScrollIntoView = vi.fn();
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(queryResult as any);
    vi.spyOn(document, 'querySelector').mockReturnValue({
      lastElementChild: { scrollIntoView: mockScrollIntoView },
    } as any);
    vi.useFakeTimers();

    renderWithQueryClient(<SearchPage />);
    fireEvent.click(screen.getByText('Load More'));
    await vi.runAllTimersAsync();

    expect(queryResult.fetchNextPage).toHaveBeenCalled();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    vi.useRealTimers();
  });

  it('handles load previous button', () => {
    const prevQueryResult = mockQueryResult({ hasPreviousPage: true });
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(prevQueryResult as any);
    renderWithQueryClient(<SearchPage />);
    fireEvent.click(screen.getByText('Load Previous'));
    expect(prevQueryResult.fetchPreviousPage).toHaveBeenCalled();
  });

  it('hides pagination buttons when unavailable', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(
      mockQueryResult({ hasNextPage: false, hasPreviousPage: false }) as any,
    );
    renderWithQueryClient(<SearchPage />);
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    expect(screen.queryByText('Load Previous')).not.toBeInTheDocument();
  });

  it('handles undefined currentPage in pagination', async () => {
    const queryResult = mockQueryResult({
      data: { ...mockSearchResultsData, currentPage: undefined },
    });
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(queryResult as any);
    vi.useFakeTimers();

    renderWithQueryClient(<SearchPage />);
    fireEvent.click(screen.getByText('Load More'));
    await vi.runAllTimersAsync();

    // Just verify the button was clicked - navigation is handled by router
    expect(queryResult.fetchNextPage).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('handles mobile filter menu interactions', () => {
    renderWithQueryClient(<SearchPage />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Open mobile filter menu'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles map view parameter', () => {
    setMockSearchParams({ view: 'map' });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-map')).toBeInTheDocument();
  });

  it('handles list view parameter', () => {
    setMockSearchParams({ view: 'list' });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-map')).toBeInTheDocument();
  });

  it('disables document scroll when view is map (RemoveScroll enabled)', async () => {
    setMockSearchParams({ view: 'map' });
    renderWithQueryClient(<SearchPage />);
    await waitFor(() => {
      expect(document.body).toHaveAttribute('data-scroll-locked', '1');
    });
  });

  it('does not disable document scroll when view is list (RemoveScroll disabled)', async () => {
    setMockSearchParams({ view: 'list' });
    renderWithQueryClient(<SearchPage />);
    await waitFor(() => {
      expect(document.body).not.toHaveAttribute('data-scroll-locked');
    });
  });

  it('handles all search parameters', () => {
    setMockSearchParams({
      filter: 'campground',
      district: 'Peace',
      activities: '1,2,3',
      access: 'boat',
      facilities: 'tent',
      lat: '49.2827',
      lon: '-123.1207',
      community: 'Vancouver',
      type: 'recreation_site',
      page: '2',
    });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-banner')).toBeInTheDocument();
  });

  it('handles missing search parameters', () => {
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-banner')).toBeInTheDocument();
  });

  it('handles invalid parameters', () => {
    setMockSearchParams({ lat: 'invalid', lon: 'invalid' });
    renderWithQueryClient(<SearchPage />);
    expect(screen.getByTestId('mock-search-banner')).toBeInTheDocument();
  });

  it('updates store when data changes', () => {
    const mockSetState = vi.fn();
    searchResultsStore.setState = mockSetState;

    renderWithQueryClient(<SearchPage />);
    expect(mockSetState).toHaveBeenCalled();
  });

  it('disables load more when fetching next page', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(mockQueryResult({ isFetchingNextPage: true }) as any);
    renderWithQueryClient(<SearchPage />);
    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).toBeDisabled();
    expect(loadMoreButton).toHaveAttribute('data-loading', 'true');
  });

  it('disables load previous when fetching previous page', () => {
    vi.spyOn(
      recreationResourceQueries,
      'useSearchRecreationResourcesPaginated',
    ).mockReturnValue(
      mockQueryResult({
        hasPreviousPage: true,
        isFetchingPreviousPage: true,
      }) as any,
    );
    renderWithQueryClient(<SearchPage />);
    const loadPreviousButton = screen.getByText('Load Previous');
    expect(loadPreviousButton).toBeDisabled();
    expect(loadPreviousButton).toHaveAttribute('data-loading', 'true');
  });
});

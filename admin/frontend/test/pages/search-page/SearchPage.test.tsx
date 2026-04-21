import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPage } from '@/pages/search';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { serializeAdminSearchRouteState } from '@/pages/search/utils/urlState';

const mockRouteSearch = vi.fn();
const mockController = vi.fn();
const mockTypeahead = vi.fn();
const mockColumns = vi.fn();

vi.mock('@/routes', () => ({
  Route: {
    useSearch: () => mockRouteSearch(),
  },
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    ...props
  }: {
    children: ReactNode;
    [key: string]: unknown;
  }) => <a {...props}>{children}</a>,
}));

vi.mock('@/components/page-layout', () => ({
  PageLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock('@/pages/search/hooks/useAdminSearchController', () => ({
  useAdminSearchController: (...args: unknown[]) => mockController(...args),
}));

vi.mock('@/pages/search/hooks/useAdminSearchTypeahead', () => ({
  useAdminSearchTypeahead: (...args: unknown[]) => mockTypeahead(...args),
}));

vi.mock('@/pages/search/hooks/useAdminSearchColumns', () => ({
  useAdminSearchColumns: () => mockColumns(),
}));

vi.mock('@/pages/search/components/SearchSubmitBar', () => ({
  SearchSubmitBar: ({ committedQuery, onSubmit, onFilterCommunity }: any) => {
    return (
      <div>
        <button onClick={() => onSubmit('ridge')}>
          Search results for {committedQuery}
        </button>

        <button
          data-testid="add-community-button"
          onClick={() => onFilterCommunity?.('WHISTLER')}
        >
          Add Community
        </button>
      </div>
    );
  },
}));

vi.mock('@/pages/search/components/FilterAccordion', () => ({
  FilterAccordion: ({
    showTrigger,
    communityFilter,
  }: {
    showTrigger: boolean;
    communityFilter: string[];
  }) => (
    <div data-testid="community-filter">
      {String(showTrigger)}|{communityFilter.join(',')}
    </div>
  ),
}));

vi.mock('@/pages/search/components/AppliedFilterChips', () => ({
  AppliedFilterChips: ({
    chips,
    onClearCommunity,
  }: {
    chips: Array<{ label: string }>;
    onClearCommunity: (value: string) => void;
  }) => (
    <>
      <div data-testid="applied-filter-chips">
        {chips.map((chip) => chip.label).join(',')}
      </div>

      <button
        type="button"
        data-testid="clear-community-button"
        onClick={() => onClearCommunity('closestCommunity:WHISTLER')}
      >
        Clear community
      </button>
    </>
  ),
}));

vi.mock('@/pages/search/components/ColumnVisibilityMenu', () => ({
  ColumnVisibilityMenu: ({
    onToggle,
  }: {
    onToggle: (columnId: string) => void;
  }) => (
    <button type="button" onClick={() => onToggle('name')}>
      Toggle columns
    </button>
  ),
}));

vi.mock('@/pages/search/components/SearchResultsTable', () => ({
  SearchResultsTable: ({
    rows,
    visibleColumns,
    onSortChange,
  }: {
    rows: Array<{ recResourceId: string }>;
    visibleColumns: string[];
    onSortChange: (sort: string) => void;
  }) => (
    <div>
      <div data-testid="results-count">{rows.length}</div>
      <div data-testid="visible-columns">{visibleColumns.join(',')}</div>
      <button type="button" onClick={() => onSortChange('name:desc')}>
        Sort results
      </button>
    </div>
  ),
}));

vi.mock('@/pages/search/components/SearchResultsPagination', () => ({
  SearchResultsPagination: ({
    pagination,
  }: {
    pagination: { setPageIndex: (pageIndex: number) => void };
  }) => (
    <button type="button" onClick={() => pagination.setPageIndex(2)}>
      Go to page 3
    </button>
  ),
}));

vi.mock('@/pages/search/components/SearchResultsSummary', () => ({
  SearchResultsSummary: ({
    total,
    query,
  }: {
    total: number;
    query: string;
  }) => (
    <div>
      {total} results for {query}
    </div>
  ),
}));

const baseSearch = {
  ...DEFAULT_ADMIN_SEARCH_STATE,
  q: 'camp',
  page: 3,
};

function buildController() {
  return {
    submitQuery: vi.fn(),
    toggleFilterPanel: vi.fn(),
    isFilterPanelOpen: false,
    hasAppliedState: true,
    appliedFilterChips: [
      { key: 'query:camp', label: 'Query: camp', onClear: vi.fn() },
    ],
    results: [{ recResourceId: 'REC001' }],
    resultsError: null,
    isResultsFetching: false,
    total: 42,
    pagination: {
      state: { pageIndex: 2, pageSize: 25 },
      pageCount: 5,
      rowCount: 42,
      pageSizeOptions: [25, 50, 100],
      canPreviousPage: true,
      canNextPage: true,
      setPageIndex: vi.fn(),
      setPageSize: vi.fn(),
      previousPage: vi.fn(),
      nextPage: vi.fn(),
    },
    setSort: vi.fn(),
  };
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockRouteSearch.mockReturnValue(serializeAdminSearchRouteState(baseSearch));
    mockController.mockReturnValue(buildController());
    mockTypeahead.mockReturnValue({
      inputValue: 'camp',
      setInputValue: vi.fn(),
      suggestions: [],
      isLoading: false,
      error: null,
    });
    mockColumns.mockReturnValue({
      visibleColumns: ['rec_resource_id', 'name'],
      toggleColumn: vi.fn(),
    });
  });

  it('renders the route query into the page shell', () => {
    render(<SearchPage />);

    expect(screen.getByRole('heading', { name: 'Search' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Search results for camp' }),
    ).toBeInTheDocument();
    expect(screen.getByText('42 results for camp')).toBeInTheDocument();
    expect(screen.getByTestId('results-count')).toHaveTextContent('1');
  });

  it('wires search submit, sorting, pagination, and column toggles to the current controller state', async () => {
    const user = userEvent.setup();
    const controller = buildController();
    const toggleColumn = vi.fn();

    mockController.mockReturnValue(controller);
    mockColumns.mockReturnValue({
      visibleColumns: ['rec_resource_id', 'name'],
      toggleColumn,
    });

    render(<SearchPage />);

    await user.click(
      screen.getByRole('button', { name: 'Search results for camp' }),
    );
    await user.click(screen.getByRole('button', { name: 'Sort results' }));
    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    await user.click(screen.getByRole('button', { name: 'Toggle columns' }));

    expect(controller.submitQuery).toHaveBeenCalledWith('ridge');
    expect(controller.setSort).toHaveBeenCalledWith('name:desc');
    expect(controller.pagination.setPageIndex).toHaveBeenCalledWith(2);
    expect(toggleColumn).toHaveBeenCalledWith('name');
  });

  it('shows applied chips only when the controller reports applied state', () => {
    const controller = buildController();
    controller.hasAppliedState = false;
    mockController.mockReturnValue(controller);

    render(<SearchPage />);

    expect(
      screen.queryByTestId('applied-filter-chips'),
    ).not.toBeInTheDocument();
  });

  it('adds community filter', async () => {
    const user = userEvent.setup();

    render(<SearchPage />);

    await user.click(screen.getByTestId('add-community-button'));

    expect(screen.getByTestId('community-filter')).toHaveTextContent(
      'WHISTLER',
    );
  });

  it('clears community filter', async () => {
    const user = userEvent.setup();

    render(<SearchPage />);

    await user.click(screen.getByTestId('add-community-button'));
    await user.click(screen.getByTestId('clear-community-button'));

    expect(screen.getByTestId('community-filter')).toHaveTextContent('false|');
  });
});

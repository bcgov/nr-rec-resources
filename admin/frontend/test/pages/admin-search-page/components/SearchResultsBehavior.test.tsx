import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { FilterAccordion } from '@/pages/search/components/FilterAccordion';
import { SearchResultsPagination } from '@/pages/search/components/SearchResultsPagination';
import { SearchResultsSummary } from '@/pages/search/components/SearchResultsSummary';

describe('SearchResultsSummary', () => {
  it('renders loading, query, and total states', () => {
    const { rerender } = render(
      <SearchResultsSummary isLoading total={0} query="lake" />,
    );

    expect(screen.getByText('Loading results...')).toBeInTheDocument();

    rerender(<SearchResultsSummary isLoading={false} total={1} query="lake" />);
    expect(screen.getByText('1 result for "lake"')).toBeInTheDocument();

    rerender(<SearchResultsSummary isLoading={false} total={2} />);
    expect(screen.getByText('2 total resources')).toBeInTheDocument();
  });
});

describe('SearchResultsPagination', () => {
  it('renders nothing without rows and wires the main pagination actions', async () => {
    const user = userEvent.setup();
    const previousPage = vi.fn();
    const nextPage = vi.fn();
    const setPageIndex = vi.fn();
    const setPageSize = vi.fn();
    const { rerender } = render(
      <SearchResultsPagination
        pagination={{
          rowCount: 0,
          pageCount: 0,
          canPreviousPage: false,
          canNextPage: false,
          pageSizeOptions: [25, 50, 100],
          previousPage,
          nextPage,
          setPageIndex,
          setPageSize,
          state: { pageIndex: 0, pageSize: 25 },
        }}
      />,
    );

    expect(
      screen.queryByLabelText('search-results-pagination-page-size-select'),
    ).not.toBeInTheDocument();

    rerender(
      <SearchResultsPagination
        pagination={{
          rowCount: 240,
          pageCount: 12,
          canPreviousPage: true,
          canNextPage: true,
          pageSizeOptions: [25, 50, 100],
          previousPage,
          nextPage,
          setPageIndex,
          setPageSize,
          state: { pageIndex: 5, pageSize: 50 },
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12' })).toBeInTheDocument();
    expect(screen.getByLabelText('Jump To')).toHaveValue('6');

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.selectOptions(
      screen.getByLabelText('Page Size'),
      screen.getByRole('option', { name: '100' }),
    );
    await user.selectOptions(
      screen.getByLabelText('Jump To'),
      screen.getByRole('option', { name: '3' }),
    );

    expect(previousPage).toHaveBeenCalledTimes(1);
    expect(nextPage).toHaveBeenCalledTimes(1);
    expect(setPageIndex).toHaveBeenCalledWith(6);
    expect(setPageIndex).toHaveBeenCalledWith(2);
    expect(setPageSize).toHaveBeenCalledWith(100);
  });
});

describe('FilterAccordion', () => {
  it('applies selected filters and dates', async () => {
    const user = userEvent.setup();
    const applyFilters = vi.fn();

    render(
      <FilterAccordion
        search={DEFAULT_ADMIN_SEARCH_STATE}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel: vi.fn(),
          toggleFilterPanel: vi.fn(),
          typeOptions: [{ id: 'RTR', label: 'Rustic', is_archived: false }],
          districtOptions: [
            { id: 'D1', label: 'District 1', is_archived: false },
          ],
          activityOptions: [{ id: '8', label: 'Camping', is_archived: false }],
          accessOptions: [{ id: 'W', label: 'Walk-in', is_archived: false }],
          applyFilters,
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Resource type' }));
    await user.click(screen.getByRole('button', { name: /rustic/i }));
    await user.click(screen.getByRole('button', { name: 'District' }));
    await user.click(screen.getByRole('button', { name: /district 1/i }));
    await user.click(screen.getByRole('button', { name: 'Activities' }));
    await user.click(screen.getByRole('button', { name: /camping/i }));
    await user.click(screen.getByRole('button', { name: 'Access type' }));
    await user.click(screen.getByRole('button', { name: /walk-in/i }));
    await user.type(screen.getByLabelText('Established from'), '2020-01-01');
    await user.type(screen.getByLabelText('Established to'), '2021-01-01');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(applyFilters).toHaveBeenCalledWith({
      type: ['RTR'],
      district: ['D1'],
      activities: ['8'],
      access: ['W'],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
    });
  });

  it('resets filters and restores the route state when canceling', async () => {
    const user = userEvent.setup();
    const closeFilterPanel = vi.fn();
    const resetFilters = vi.fn();

    render(
      <FilterAccordion
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          type: ['RTR'],
          establishment_date_from: '2020-01-01',
        }}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel,
          toggleFilterPanel: vi.fn(),
          typeOptions: [{ id: 'RTR', label: 'Rustic', is_archived: false }],
          districtOptions: [],
          activityOptions: [],
          accessOptions: [],
          applyFilters: vi.fn(),
          resetFilters,
        }}
        showTrigger={false}
      />,
    );

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Resource type (1)' }));
    await user.click(screen.getByRole('button', { name: /rustic/i }));
    expect(applyButton).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeFilterPanel).toHaveBeenCalledTimes(1);
    expect(applyButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});

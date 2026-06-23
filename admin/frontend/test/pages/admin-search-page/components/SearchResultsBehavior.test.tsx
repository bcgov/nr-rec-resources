import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { FilterAccordion } from '@/pages/search/components/FilterAccordion';
import { SearchResultsPagination } from '@/pages/search/components/SearchResultsPagination';
import { SearchResultsSummary } from '@/pages/search/components/SearchResultsSummary';

// Treat all tests in this file as super-admin so the implicit "Issued (HI)"
// default is not injected, keeping assertions clean and focused.
vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => ({
    canViewFeatureFlag: false,
    canEditArchived: true,
  }),
}));

const establishedOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

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
          closestCommunityOptions: [
            { id: 'WHISTLER', label: 'Whistler' },
            { id: 'MERRIT', label: 'Merrit' },
          ],
          districtOptions: [
            { id: 'D1', label: 'District 1', is_archived: false },
          ],
          activityOptions: [{ id: '8', label: 'Camping', is_archived: false }],
          statusOptions: [],
          accessOptions: [{ id: 'W', label: 'Walk-in', is_archived: false }],
          establishedOptions,
          publicAccessStatusOptions: [],
          recStatusOptions: [],
          applyFilters,
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/established from/i), {
      target: { value: '2020-01-01' },
    });

    fireEvent.change(screen.getByLabelText(/established to/i), {
      target: { value: '2021-01-01' },
    });

    const applyButton = screen.getByRole('button', { name: /apply/i });

    await user.click(applyButton);

    expect(applyFilters).toHaveBeenCalled();

    expect(applyFilters).toHaveBeenLastCalledWith({
      type: [],
      district: [],
      activities: [],
      status: [],
      access: [],
      closestCommunity: [],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
      established: undefined,
      publicAccessStatus: [],
      recStatus: [],
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
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
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

  it('supports searching long multiselect option lists', async () => {
    const user = userEvent.setup();

    render(
      <FilterAccordion
        search={DEFAULT_ADMIN_SEARCH_STATE}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel: vi.fn(),
          toggleFilterPanel: vi.fn(),
          typeOptions: [
            { id: 'RUSTIC', label: 'Rustic', is_archived: false },
            { id: 'CABIN', label: 'Cabin', is_archived: false },
            { id: 'LODGE', label: 'Lodge', is_archived: false },
            { id: 'CAMPSITE', label: 'Campsite', is_archived: false },
            { id: 'VIEWPOINT', label: 'Viewpoint', is_archived: false },
            { id: 'PICNIC', label: 'Picnic Site', is_archived: false },
            { id: 'DAYUSE', label: 'Day Use Area', is_archived: false },
            { id: 'TRAILHEAD', label: 'Trailhead', is_archived: false },
            { id: 'LOOKOUT', label: 'Lookout', is_archived: false },
            { id: 'SHELTER', label: 'Shelter', is_archived: false },
            { id: 'BEACH', label: 'Beach Access', is_archived: false },
            { id: 'BOAT', label: 'Boat Launch', is_archived: false },
            { id: 'PARKING', label: 'Parking Area', is_archived: false },
            { id: 'BOARDWALK', label: 'Boardwalk', is_archived: false },
            { id: 'VIEWDECK', label: 'Viewing Deck', is_archived: false },
          ],
          districtOptions: [],
          activityOptions: [],
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
          applyFilters: vi.fn(),
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Resource type' }));
    await user.type(screen.getByLabelText('Search Resource type'), 'cabin');

    expect(screen.getByRole('button', { name: 'Cabin' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Rustic' }),
    ).not.toBeInTheDocument();
  });

  it('applies established filter when selected', async () => {
    const user = userEvent.setup();
    const applyFilters = vi.fn();

    render(
      <FilterAccordion
        search={DEFAULT_ADMIN_SEARCH_STATE}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel: vi.fn(),
          toggleFilterPanel: vi.fn(),
          typeOptions: [],
          districtOptions: [],
          activityOptions: [],
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
          recStatusOptions: [],
          applyFilters,
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    const establishedSelect = screen.getByDisplayValue('Established');
    await user.selectOptions(establishedSelect, 'yes');

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeEnabled();

    await user.click(applyButton);

    expect(applyFilters).toHaveBeenLastCalledWith({
      type: [],
      district: [],
      activities: [],
      status: [],
      access: [],
      closestCommunity: [],
      establishment_date_from: undefined,
      establishment_date_to: undefined,
      established: 'yes',
      publicAccessStatus: [],
      recStatus: [],
    });
  });

  it('clears established filter when changed back to default', async () => {
    const user = userEvent.setup();
    const applyFilters = vi.fn();

    render(
      <FilterAccordion
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          established: 'yes',
        }}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel: vi.fn(),
          toggleFilterPanel: vi.fn(),
          typeOptions: [],
          districtOptions: [],
          activityOptions: [],
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
          recStatusOptions: [],
          applyFilters,
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    const establishedSelect = screen.getByDisplayValue('Yes');
    fireEvent.change(establishedSelect, { target: { value: '' } });

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeEnabled();

    await user.click(applyButton);

    expect(applyFilters).toHaveBeenLastCalledWith({
      type: [],
      district: [],
      activities: [],
      status: [],
      access: [],
      closestCommunity: [],
      establishment_date_from: undefined,
      establishment_date_to: undefined,
      established: undefined,
      publicAccessStatus: [],
      recStatus: [],
    });
  });

  it('preserves established filter when canceling without changes', async () => {
    const user = userEvent.setup();
    const closeFilterPanel = vi.fn();

    render(
      <FilterAccordion
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          established: 'yes',
        }}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel,
          toggleFilterPanel: vi.fn(),
          typeOptions: [],
          districtOptions: [],
          activityOptions: [],
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
          applyFilters: vi.fn(),
          resetFilters: vi.fn(),
        }}
        showTrigger={false}
      />,
    );

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeFilterPanel).toHaveBeenCalledTimes(1);
  });

  it('resets established filter when reset filters is clicked', async () => {
    const user = userEvent.setup();
    const resetFilters = vi.fn();

    render(
      <FilterAccordion
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          established: 'yes',
        }}
        controller={{
          isFilterPanelOpen: true,
          closeFilterPanel: vi.fn(),
          toggleFilterPanel: vi.fn(),
          typeOptions: [],
          districtOptions: [],
          activityOptions: [],
          statusOptions: [],
          accessOptions: [],
          establishedOptions,
          publicAccessStatusOptions: [],
          closestCommunityOptions: [],
          applyFilters: vi.fn(),
          resetFilters,
        }}
        showTrigger={false}
      />,
    );

    expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));

    expect(resetFilters).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue('Established')).toBeInTheDocument();
  });
});

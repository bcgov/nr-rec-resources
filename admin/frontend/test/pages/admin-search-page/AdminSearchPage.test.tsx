import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSearchPage } from '@/pages/admin-search-page';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/admin-search-page/constants';
import { AdminSearchRouteState } from '@/pages/admin-search-page/types';
import { serializeAdminSearchRouteState } from '@/pages/admin-search-page/utils/urlState';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<object>('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/pages/admin-search-page/components/SearchSubmitBar', () => ({
  SearchSubmitBar: ({ onSubmit }: { onSubmit: () => void }) => (
    <button type="button" onClick={onSubmit}>
      Search results
    </button>
  ),
}));

vi.mock('@/pages/admin-search-page/hooks/useAdminSearchTypeahead', () => ({
  useAdminSearchTypeahead: () => ({
    inputValue: 'lake',
    setInputValue: vi.fn(),
    setSearchTerm: vi.fn(),
    suggestions: [],
    isLoading: false,
    error: null,
    isValidSearchTerm: true,
  }),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSearch',
  () => ({
    default: () => ({
      data: {
        data: [
          {
            rec_resource_id: 'REC001',
            name: 'Blue Lake',
            recreation_resource_type: 'Recreation site',
            established_date: '2024-06-10',
            access_types: ['Walk in'],
            fee_types: ['Has fees'],
            campsite_count: 2,
            closest_community: 'Hope',
          },
        ],
        total: 42,
        page: 3,
        page_size: 10,
      },
      isLoading: false,
      isFetching: false,
      error: null,
    }),
  }),
);

vi.mock('@/services', async () => {
  const actual = await vi.importActual<object>('@/services');

  return {
    ...actual,
    useGetRecreationResourceOptions: () => ({
      data: [
        {
          type: 'activities',
          options: [
            { id: '1', label: 'Hiking' },
            { id: '2', label: 'Fishing' },
          ],
        },
        {
          type: 'resourceType',
          options: [
            { id: 'SIT', label: 'Recreation site' },
            { id: 'RTR', label: 'Trail' },
          ],
        },
        {
          type: 'access',
          options: [{ id: 'W', label: 'Walk in' }],
        },
        {
          type: 'district',
          options: [
            { id: 'DCK', label: 'Chilliwack', is_archived: false },
            { id: 'RDKB', label: 'Kootenay Boundary', is_archived: false },
          ],
        },
      ],
      isLoading: false,
    }),
  };
});

const baseSearch: AdminSearchRouteState = {
  ...DEFAULT_ADMIN_SEARCH_STATE,
  q: 'camp',
  page: 3,
};

describe('AdminSearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('updates route search state when sorting changes', async () => {
    const user = userEvent.setup();

    render(<AdminSearchPage search={baseSearch} />);

    await user.click(screen.getByRole('button', { name: /sort by rec #/i }));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        sort: 'rec_resource_id:asc',
      }),
      resetScroll: false,
    });
  });

  it('supports server-driven pagination and jump-to-page changes', async () => {
    const user = userEvent.setup();

    render(<AdminSearchPage search={baseSearch} />);

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        page: 2,
      }),
      resetScroll: false,
    });

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Jump to page' }),
      '4',
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(2, {
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        page: 4,
      }),
      resetScroll: false,
    });
  });

  it('applies filter interactions through route search updates', async () => {
    const user = userEvent.setup();

    render(<AdminSearchPage search={baseSearch} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Resource type' }));
    await user.click(screen.getByRole('button', { name: /Recreation site/i }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        type: ['SIT'],
        page: 1,
      }),
      resetScroll: false,
    });

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        type: [],
        district: [],
        activities: [],
        access: [],
        establishment_date_from: undefined,
        establishment_date_to: undefined,
        page: 1,
      }),
      resetScroll: false,
    });
  });

  it('accumulates district and activity selections before applying filters', async () => {
    const user = userEvent.setup();

    render(<AdminSearchPage search={baseSearch} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'District' }));
    await user.click(screen.getByRole('button', { name: /Chilliwack/i }));
    await user.click(
      screen.getByRole('button', { name: /Kootenay Boundary/i }),
    );
    await user.click(screen.getByRole('button', { name: 'Activities' }));
    await user.click(screen.getByRole('button', { name: /Hiking/i }));
    await user.click(screen.getByRole('button', { name: /Fishing/i }));

    expect(
      screen.getByRole('button', { name: 'District (2)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Activities (2)' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: serializeAdminSearchRouteState({
        ...baseSearch,
        district: ['DCK', 'RDKB'],
        activities: ['1', '2'],
        page: 1,
      }),
      resetScroll: false,
    });
  });

  it('keeps apply disabled when a filter change is reverted', async () => {
    const user = userEvent.setup();

    render(<AdminSearchPage search={baseSearch} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));

    const applyButton = screen.getByRole('button', { name: 'Apply' });

    await user.click(screen.getByRole('button', { name: 'Resource type' }));
    await user.click(screen.getByRole('button', { name: /Recreation site/i }));
    expect(applyButton).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /Recreation site/i }));
    expect(applyButton).toBeDisabled();
  });

  it('keeps the filter form visible when filters are already active', () => {
    render(
      <AdminSearchPage
        search={{
          ...baseSearch,
          type: ['RR'],
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Resource type (1)' }),
    ).toBeInTheDocument();
  });

  it('does not render the filter form when the panel is closed', () => {
    render(<AdminSearchPage search={baseSearch} />);

    expect(screen.queryByLabelText('Resource type')).not.toBeInTheDocument();
  });

  it('does not render tab controls on the search page', () => {
    render(<AdminSearchPage search={baseSearch} />);

    expect(
      screen.queryByRole('button', { name: 'All' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sites' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Trails' }),
    ).not.toBeInTheDocument();
  });
});

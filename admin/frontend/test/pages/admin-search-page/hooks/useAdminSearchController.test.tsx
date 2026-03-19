import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { useAdminSearchController } from '@/pages/search/hooks/useAdminSearchController';
import * as storage from '@/pages/search/utils/storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();
const mockUseGetRecreationResourceSearch = vi.fn();
const mockUseGetRecreationResourceOptions = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<object>('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSearch',
  () => ({
    default: (...args: unknown[]) =>
      mockUseGetRecreationResourceSearch(...args),
  }),
);

vi.mock('@/services', async () => {
  const actual = await vi.importActual<object>('@/services');

  return {
    ...actual,
    useGetRecreationResourceOptions: (...args: unknown[]) =>
      mockUseGetRecreationResourceOptions(...args),
  };
});

describe('useAdminSearchController', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockNavigate.mockReset();
    mockUseGetRecreationResourceSearch.mockReset();
    mockUseGetRecreationResourceOptions.mockReset();

    mockUseGetRecreationResourceSearch.mockReturnValue({
      data: {
        data: [],
        total: 0,
        page: 1,
        page_size: 25,
      },
      isLoading: false,
      isFetching: false,
      error: null,
    });

    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [
        { type: 'activities', options: [] },
        { type: 'resourceType', options: [] },
        { type: 'access', options: [] },
        {
          type: 'district',
          options: [
            { id: 'B', label: 'Beta District', is_archived: false },
            { id: 'A', label: 'Archived District', is_archived: true },
            { id: 'C', label: 'Alpha District', is_archived: false },
          ],
        },
      ],
      isLoading: false,
    });

    vi.spyOn(storage, 'readAdminSearchFilterPanelOpen').mockReturnValue(false);
    vi.spyOn(storage, 'writeAdminSearchFilterPanelOpen').mockImplementation(
      vi.fn(),
    );
  });

  it('filters archived district options from admin search filters', () => {
    const { result } = renderHook(
      () => useAdminSearchController(DEFAULT_ADMIN_SEARCH_STATE),
      { wrapper: createWrapper() },
    );

    expect(result.current.districtOptions).toEqual([
      { id: 'C', label: 'Alpha District', is_archived: false },
      { id: 'B', label: 'Beta District', is_archived: false },
    ]);
  });

  it('resets to page 1 when page size changes', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      page: 4,
      page_size: 25,
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    result.current.pagination.setPageSize(100);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: { page_size: 100 },
      resetScroll: false,
    });
  });

  it('builds clearable applied filter chips for the active search state', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: 'lake',
      type: ['RTR'],
      district: ['C'],
      activities: ['8'],
      access: ['W'],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    expect(result.current.appliedFilterChips.map((chip) => chip.label)).toEqual(
      [
        'RTR',
        'Alpha District',
        '8',
        'W',
        'Established from: 2020-01-01',
        'Established to: 2021-01-01',
      ],
    );

    result.current.appliedFilterChips[0].onClear();
    result.current.appliedFilterChips[1].onClear();
    result.current.appliedFilterChips[4].onClear();
    result.current.appliedFilterChips[5].onClear();

    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: {
        q: 'lake',
        district: 'C',
        activities: '8',
        access: 'W',
        establishment_date_from: '2020-01-01',
        establishment_date_to: '2021-01-01',
      },
      resetScroll: false,
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(2, {
      to: '/',
      search: {
        q: 'lake',
        type: 'RTR',
        activities: '8',
        access: 'W',
        establishment_date_from: '2020-01-01',
        establishment_date_to: '2021-01-01',
      },
      resetScroll: false,
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(3, {
      to: '/',
      search: {
        q: 'lake',
        type: 'RTR',
        district: 'C',
        activities: '8',
        access: 'W',
        establishment_date_to: '2021-01-01',
      },
      resetScroll: false,
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(4, {
      to: '/',
      search: {
        q: 'lake',
        type: 'RTR',
        district: 'C',
        activities: '8',
        access: 'W',
        establishment_date_from: '2020-01-01',
      },
      resetScroll: false,
    });
  });

  it('persists preferred filter-panel state only when there are no active filters', () => {
    const writeSpy = vi.mocked(storage.writeAdminSearchFilterPanelOpen);
    const { result: noFilters } = renderHook(
      () => useAdminSearchController(DEFAULT_ADMIN_SEARCH_STATE),
      { wrapper: createWrapper() },
    );

    expect(noFilters.current.isFilterPanelOpen).toBe(false);
    act(() => {
      noFilters.current.toggleFilterPanel();
    });
    expect(writeSpy).toHaveBeenCalledWith(true);

    const { result: withFilters } = renderHook(
      () =>
        useAdminSearchController({
          ...DEFAULT_ADMIN_SEARCH_STATE,
          type: ['RTR'],
        }),
      { wrapper: createWrapper() },
    );

    expect(withFilters.current.isFilterPanelOpen).toBe(true);
    act(() => {
      withFilters.current.closeFilterPanel();
    });
    expect(withFilters.current.isFilterPanelOpen).toBe(false);
    expect(writeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      withFilters.current.toggleFilterPanel();
    });
    expect(withFilters.current.isFilterPanelOpen).toBe(true);
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });
});

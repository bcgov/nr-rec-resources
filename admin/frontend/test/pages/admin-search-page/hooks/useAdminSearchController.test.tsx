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

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => ({
    canViewFeatureFlag: false,
    canEditArchived: true,
  }),
}));

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
        {
          type: 'recreationStatus',
          options: [{ id: '1', label: 'Open', is_archived: false }],
        },
        { type: 'access', options: [] },
        { type: 'closestCommunity', options: [] },
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
      status: ['1'],
      access: ['W'],
      closestCommunity: ['WHISTLER'],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    expect(result.current.appliedFilterChips.map((chip) => chip.label)).toEqual(
      [
        'RTR',
        'C',
        '8',
        'Open',
        'W',
        'Whistler',
        'Established from: 2020-01-01',
        'Established to: 2021-01-01',
      ],
    );

    result.current.appliedFilterChips[0].onClear();
    result.current.appliedFilterChips[1].onClear();
    result.current.appliedFilterChips[5].onClear();
    result.current.appliedFilterChips[6].onClear();

    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/',
      search: {
        q: 'lake',
        district: 'C',
        activities: '8',
        closestCommunity: 'WHISTLER',
        status: '1',
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
        closestCommunity: 'WHISTLER',
        status: '1',
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
        status: '1',
        access: 'W',
        establishment_date_from: '2020-01-01',
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
        closestCommunity: 'WHISTLER',
        status: '1',
        access: 'W',
        establishment_date_to: '2021-01-01',
      },
      resetScroll: false,
    });
  });

  it('generates filter chip for established=yes and established=no', () => {
    const searchYes = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
    };
    const searchNo = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'no',
    };

    const { result: resultYes } = renderHook(
      () => useAdminSearchController(searchYes),
      { wrapper: createWrapper() },
    );
    const { result: resultNo } = renderHook(
      () => useAdminSearchController(searchNo),
      { wrapper: createWrapper() },
    );

    const chipYes = resultYes.current.appliedFilterChips.find(
      (chip) => chip.key === 'established:yes',
    );
    const chipNo = resultNo.current.appliedFilterChips.find(
      (chip) => chip.key === 'established:no',
    );

    expect(chipYes?.label).toBe('Established: Yes');
    expect(chipNo?.label).toBe('Established: No');
  });

  it('uses raw established value when no known label mapping exists', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'unknown',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    const chip = result.current.appliedFilterChips.find(
      (entry) => entry.key === 'established:unknown',
    );

    expect(chip?.label).toBe('Established: unknown');
  });

  it('does not generate filter chip when established is undefined', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: undefined,
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    const establishedChip = result.current.appliedFilterChips.find((chip) =>
      chip.key?.startsWith('established:'),
    );

    expect(establishedChip).toBeUndefined();
  });

  it('clears established filter when calling clearEstablished', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.clearEstablished();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      resetScroll: false,
    });
  });

  it('clears established filter when using the established chip clear action', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    const chip = result.current.appliedFilterChips.find(
      (entry) => entry.key === 'established:yes',
    );

    act(() => {
      chip?.onClear();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      resetScroll: false,
    });
  });

  it('adds a trimmed closest community when value is new', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      closestCommunity: ['KAMLOOPS'],
      page: 4,
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addClosestCommunity('  WHISTLER  ');
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: {
        closestCommunity: 'KAMLOOPS_WHISTLER',
      },
      resetScroll: false,
    });
  });

  it('does not add closest community for empty or duplicate values', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      closestCommunity: ['KAMLOOPS'],
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addClosestCommunity('   ');
      result.current.addClosestCommunity('KAMLOOPS');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('detects established filter as active filter', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasAppliedState).toBe(true);
  });

  it('applies established filter through applyFilters', () => {
    const search = DEFAULT_ADMIN_SEARCH_STATE;
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.applyFilters({
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
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: expect.objectContaining({
        established: 'yes',
      }),
      resetScroll: false,
    });
  });

  it('resets established filter when calling resetFilters', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
      type: ['RTR'],
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
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

  it('provides establishedOptions with yes and no values', () => {
    const { result } = renderHook(
      () => useAdminSearchController(DEFAULT_ADMIN_SEARCH_STATE),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.establishedOptions).toEqual([
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ]);
  });

  it('provides publicAccessStatusOptions from constants', () => {
    const { result } = renderHook(
      () => useAdminSearchController(DEFAULT_ADMIN_SEARCH_STATE),
      { wrapper: createWrapper() },
    );

    expect(result.current.publicAccessStatusOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'Open', label: 'Open' }),
        expect.objectContaining({ id: 'Closed', label: 'Closed' }),
      ]),
    );
    expect(result.current.publicAccessStatusOptions.length).toBeGreaterThan(0);
  });

  it('generates filter chip for publicAccessStatus and clears on chip action', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      publicAccessStatus: ['Closed', 'Restricted'],
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    const chips = result.current.appliedFilterChips.filter((chip) =>
      chip.key.startsWith('publicAccessStatus:'),
    );

    expect(chips.map((chip) => chip.label)).toEqual(['Closed', 'Restricted']);

    act(() => {
      chips[0].onClear();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: { publicAccessStatus: 'Restricted' },
      resetScroll: false,
    });
  });

  it('detects publicAccessStatus filter as active filter', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      publicAccessStatus: ['Open'],
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasAppliedState).toBe(true);
  });

  it('clears publicAccessStatus filter via clearPublicAccessStatus', () => {
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      publicAccessStatus: ['Closed', 'Open'],
    };
    const { result } = renderHook(() => useAdminSearchController(search), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.clearPublicAccessStatus('Closed');
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: { publicAccessStatus: 'Open' },
      resetScroll: false,
    });
  });
});

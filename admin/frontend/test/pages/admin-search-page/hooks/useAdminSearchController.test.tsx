import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { useAdminSearchController } from '@/pages/search/hooks/useAdminSearchController';
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
});

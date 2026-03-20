import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import useGetRecreationResourceSearch from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSearch';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock, describe, beforeEach, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

describe('useGetRecreationResourceSearch', () => {
  const mockSearchRecreationResources = vi.fn();
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue({
      searchRecreationResources: mockSearchRecreationResources,
    });
    createRetryHandler.mockReturnValue(() => false);
  });

  it('maps route state into the backend search request', async () => {
    mockSearchRecreationResources.mockResolvedValueOnce({
      page: 2,
      page_size: 25,
      total: 1,
      data: [],
    });

    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: 'ridge',
      page: 2,
      page_size: 50,
      type: ['RTR', 'RTE'],
      district: ['RDCS'],
      activities: ['1', '2'],
      status: ['1'],
      access: ['W'],
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
    };

    const { result } = renderHook(
      () => useGetRecreationResourceSearch(search),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSearchRecreationResources).toHaveBeenCalledWith({
      q: 'ridge',
      sort: 'name:asc',
      page: 2,
      pageSize: 50,
      type: ['RTR', 'RTE'],
      district: ['RDCS'],
      activities: ['1', '2'],
      status: ['1'],
      access: ['W'],
      establishmentDateFrom: '2020-01-01',
      establishmentDateTo: '2021-01-01',
    });
  });

  it('omits empty optional fields from the backend search request', async () => {
    mockSearchRecreationResources.mockResolvedValueOnce({
      page: 1,
      page_size: 25,
      total: 0,
      data: [],
    });

    const { result } = renderHook(
      () => useGetRecreationResourceSearch(DEFAULT_ADMIN_SEARCH_STATE),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSearchRecreationResources).toHaveBeenCalledWith({
      q: undefined,
      sort: 'name:asc',
      page: 1,
      pageSize: 25,
      type: undefined,
      district: undefined,
      activities: undefined,
      status: undefined,
      access: undefined,
      establishmentDateFrom: undefined,
      establishmentDateTo: undefined,
    });
  });
});

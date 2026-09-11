import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FC, ReactNode } from 'react';
import { jsx } from 'react/jsx-runtime';

import { useGetPartners } from '@/services/hooks/recreation-resource-admin/useGetPartners';
import * as services from '@/services';
import * as notificationStore from '@/store/notificationStore';
import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';
import * as queryKeysModule from '@/services/hooks/recreation-resource-admin/queryKeys';

vi.mock('@/services');
vi.mock('@/store/notificationStore');
vi.mock('./helpers');
vi.mock('./queryKeys');

describe('useGetPartners', () => {
  let queryClient: QueryClient;
  const mockApi = {
    getRecreationPartnersByResourceId: vi.fn(),
  };

  const createWrapper = () => {
    const Wrapper: FC<{ children: ReactNode }> = ({ children }) =>
      jsx(QueryClientProvider, { client: queryClient, children });
    return Wrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    vi.spyOn(services, 'usePartnersApiClient').mockReturnValue(mockApi as any);

    vi.spyOn(
      queryKeysModule.RECREATION_RESOURCE_QUERY_KEYS,
      'partners',
    ).mockImplementation(
      (id: string) => ['recreation-resource-admin', 'partners', id] as const,
    );

    vi.spyOn(helpers, 'createRetryHandler').mockImplementation(
      (options?: {
        maxRetries?: number;
        onFail?: (error: unknown) => void;
      }) => {
        return (retryCount: number, error: unknown) => {
          options?.onFail?.(error);
          return false;
        };
      },
    );

    vi.spyOn(notificationStore, 'addErrorNotification').mockImplementation(
      () => {},
    );
  });

  it('should return initial data and stay disabled when recResourceId is not provided', () => {
    const { result } = renderHook(() => useGetPartners(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isFetching).toBe(false);
    expect(mockApi.getRecreationPartnersByResourceId).not.toHaveBeenCalled();
  });

  it('should fetch partners successfully when recResourceId is provided', async () => {
    const mockData = [{ id: '1', name: 'Partner 1' }];
    mockApi.getRecreationPartnersByResourceId.mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useGetPartners('resource-123', { initialDataUpdatedAt: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(mockApi.getRecreationPartnersByResourceId).toHaveBeenCalledWith({
        recResourceId: 'resource-123',
      }),
    );

    await waitFor(() => expect(result.current.data).toEqual(mockData));

    expect(
      queryKeysModule.RECREATION_RESOURCE_QUERY_KEYS.partners,
    ).toHaveBeenCalledWith('resource-123');
  });

  it('should trigger addErrorNotification on failure callback of retry handler', () => {
    renderHook(() => useGetPartners('resource-123'), {
      wrapper: createWrapper(),
    });

    expect(helpers.createRetryHandler).toHaveBeenCalled();

    const mockCreateRetryHandler = vi.mocked(helpers.createRetryHandler);
    const retryConfig = mockCreateRetryHandler.mock.calls[0]?.[0];

    retryConfig?.onFail?.(new Error('Network failure'));

    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      'Failed to load partners after multiple attempts. Please try again later.',
      'getPartners-error',
    );
  });

  it('should override default query options when queryOptions are passed', async () => {
    mockApi.getRecreationPartnersByResourceId.mockResolvedValueOnce([]);

    const customQueryOptions = {
      initialDataUpdatedAt: 0,
      staleTime: 5000,
    };

    renderHook(
      () => useGetPartners('resource-123', customQueryOptions as any),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockApi.getRecreationPartnersByResourceId).toHaveBeenCalledWith({
        recResourceId: 'resource-123',
      });
    });
  });
});

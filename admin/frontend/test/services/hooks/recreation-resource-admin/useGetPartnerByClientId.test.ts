import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FC, ReactNode } from 'react';
import { jsx } from 'react/jsx-runtime';

import { useGetPartnerByClientId } from '@/services/hooks/recreation-resource-admin/useGetPartnerByClientId';
import * as services from '@/services';
import * as notificationStore from '@/store/notificationStore';
import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';

vi.mock('@/services');
vi.mock('@/store/notificationStore');
vi.mock('./helpers');

describe('useGetPartnerByClientId', () => {
  let queryClient: QueryClient;
  const mockApi = {
    getPartnerByClientId: vi.fn(),
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
        mutations: {
          retry: false,
        },
      },
    });

    vi.spyOn(services, 'usePartnersApiClient').mockReturnValue(mockApi as any);

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

  it('should execute mutationFn and fetch partner locations successfully', async () => {
    const mockPartner = { id: 'loc-1', name: 'Location 1' };
    mockApi.getPartnerByClientId.mockResolvedValueOnce(mockPartner);

    const { result } = renderHook(() => useGetPartnerByClientId(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('client-123');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.getPartnerByClientId).toHaveBeenCalledWith({
      clientId: 'client-123',
    });
    expect(result.current.data).toEqual(mockPartner);
  });

  it('should trigger addErrorNotification on failure callback of retry handler', () => {
    renderHook(() => useGetPartnerByClientId(), {
      wrapper: createWrapper(),
    });

    expect(helpers.createRetryHandler).toHaveBeenCalled();

    const mockCreateRetryHandler = vi.mocked(helpers.createRetryHandler);
    const retryConfig = mockCreateRetryHandler.mock.calls[0]?.[0];

    retryConfig?.onFail?.(new Error('Network failure'));

    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      'Failed to load partner information after multiple attempts. Please try again later.',
      'getPartnerByClientId-error',
    );
  });

  it('should handle mutation failure when api call rejects', async () => {
    const mockError = new Error('Failed to fetch');
    mockApi.getPartnerByClientId.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useGetPartnerByClientId(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate('client-123');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });

  it('should override mutation default options when custom mutationOptions are provided', async () => {
    const onSuccessMock = vi.fn();
    mockApi.getPartnerByClientId.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () =>
        useGetPartnerByClientId({
          onSuccess: onSuccessMock,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate('client-123');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccessMock).toHaveBeenCalled();
  });
});

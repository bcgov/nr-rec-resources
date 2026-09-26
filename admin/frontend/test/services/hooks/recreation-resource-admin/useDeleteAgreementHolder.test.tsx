import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useDeleteAgreementHolder } from '@/services/hooks/recreation-resource-admin/useDeleteAgreementHolder';
import { usePartnersApiClient } from '@/services/hooks/recreation-resource-admin/usePartnersApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';

vi.mock(
  '@/services/hooks/recreation-resource-admin/usePartnersApiClient',
  () => ({
    usePartnersApiClient: vi.fn(),
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn((options) => {
    return () => {
      options?.onFail?.();
      return false;
    };
  }),
}));

describe('useDeleteAgreementHolder', () => {
  let queryClient: QueryClient;
  const mockDelete = vi.fn();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const payload = { recResourceId: 'res-123', agreementHolderId: 42 };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.mocked(usePartnersApiClient).mockReturnValue({
      deleteRecreationResourceAgreementHolder: mockDelete,
    } as any);
  });

  it('calls the API, notifies, and invalidates the partners query', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockDelete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteAgreementHolder(), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDelete).toHaveBeenCalledWith({
      recResourceId: 'res-123',
      agreementHolderId: 42,
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Partner deleted successfully.',
      'deleteAgreementHolder-success',
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners('res-123'),
    });
  });

  it('notifies on failure', async () => {
    mockDelete.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useDeleteAgreementHolder(), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete partner.',
      'deleteAgreementHolder-error',
    );
  });

  it('notifies once the retry handler gives up', () => {
    const retryFn = vi.mocked(helpers.createRetryHandler)({
      onFail: () =>
        addErrorNotification(
          'Failed to delete partner after multiple attempts. Please try again later.',
          'deleteAgreementHolder-error',
        ),
    });

    retryFn(3, new Error('Max retries reached'));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete partner after multiple attempts. Please try again later.',
      'deleteAgreementHolder-error',
    );
  });
});

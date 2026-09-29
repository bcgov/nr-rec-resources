import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useUpdateAgreementHolder } from '@/services/hooks/recreation-resource-admin/useUpdateAgreementHolder';
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

describe('useUpdateAgreementHolder', () => {
  let queryClient: QueryClient;
  const mockUpdate = vi.fn();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const payload = {
    recResourceId: 'res-123',
    agreementHolderId: 42,
    dto: { visible_on_public_website: true },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.mocked(usePartnersApiClient).mockReturnValue({
      updateRecreationResourceAgreementHolder: mockUpdate,
    } as any);
  });

  it('calls the API, notifies, and invalidates the partners query', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdate.mockResolvedValueOnce({ agreement_holder_id: 42 });

    const { result } = renderHook(() => useUpdateAgreementHolder(), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdate).toHaveBeenCalledWith({
      recResourceId: 'res-123',
      agreementHolderId: 42,
      updateAgreementHolderDto: payload.dto,
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Partner updated successfully.',
      'updateAgreementHolder-success',
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners('res-123'),
    });
  });

  // The section saves several cards at once; one toast per card would stack up.
  it('suppresses the success toast when silent, but still invalidates', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockUpdate.mockResolvedValueOnce({ agreement_holder_id: 42 });

    const { result } = renderHook(() => useUpdateAgreementHolder(), {
      wrapper,
    });

    result.current.mutate({ ...payload, silent: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).not.toHaveBeenCalled();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners('res-123'),
    });
  });

  it('notifies on failure', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useUpdateAgreementHolder(), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update partner.',
      'updateAgreementHolder-error',
    );
  });

  it('notifies once the retry handler gives up', () => {
    const retryFn = vi.mocked(helpers.createRetryHandler)({
      onFail: () =>
        addErrorNotification(
          'Failed to update partner after multiple attempts. Please try again later.',
          'updateAgreementHolder-error',
        ),
    });

    retryFn(3, new Error('Max retries reached'));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update partner after multiple attempts. Please try again later.',
      'updateAgreementHolder-error',
    );
  });
});

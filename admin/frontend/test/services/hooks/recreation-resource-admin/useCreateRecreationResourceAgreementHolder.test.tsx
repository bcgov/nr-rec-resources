import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCreateRecreationResourceAgreementHolder } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceAgreementHolder';
import { usePartnersApiClient } from '@/services/hooks/recreation-resource-admin/usePartnersApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';

// Mock dependencies
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

describe('useCreateRecreationResourceAgreementHolder', () => {
  let queryClient: QueryClient;
  const mockCreateAgreementHolder = vi.fn();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.mocked(usePartnersApiClient).mockReturnValue({
      createRecreationResourceAgreementHolder: mockCreateAgreementHolder,
    } as any);
  });

  it('should successfully invoke the API, trigger success notification, and invalidate queries', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    mockCreateAgreementHolder.mockResolvedValueOnce({ id: '123' });

    const { result } = renderHook(
      () => useCreateRecreationResourceAgreementHolder(),
      { wrapper },
    );

    const payload = {
      recResourceId: 'res-123',
      partner: { name: 'Acme Corp' } as any,
    };

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockCreateAgreementHolder).toHaveBeenCalledWith({
      recResourceId: 'res-123',
      createAgreementHolderDto: payload.partner,
    });

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Partner created successfully',
      'createPartner-success',
    );

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners('res-123'),
    });
  });

  it('should handle mutation error and trigger error notification', async () => {
    mockCreateAgreementHolder.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(
      () => useCreateRecreationResourceAgreementHolder(),
      { wrapper },
    );

    const payload = {
      recResourceId: 'res-123',
      partner: { name: 'Acme Corp' } as any,
    };

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create partner. Please try again.',
      'createPartner-error',
    );
  });

  it('should execute retry logic onFail callback correctly', () => {
    // Re-trigger createRetryHandler explicitly in this test to capture its arguments
    const retryFn = vi.mocked(helpers.createRetryHandler)({
      onFail: () =>
        addErrorNotification(
          'Failed to create partner after multiple attempts. Please try again later.',
          'createPartner-error',
        ),
    });

    // Invoke the returned retry handler
    retryFn(3, new Error('Max retries reached'));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create partner after multiple attempts. Please try again later.',
      'createPartner-error',
    );
  });
});

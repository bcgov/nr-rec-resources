import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useUpdateFee } from '@/services/hooks/recreation-resource-admin/useUpdateFee';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
  mapRecreationFee: vi.fn((fee: any) => fee),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useUpdateFee', () => {
  const mockApiUpdateFee = vi.fn();
  const mockApi = {
    updateRecreationResourceFee: mockApiUpdateFee,
  };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('calls the API with correct parameters', async () => {
    const recResourceId = 'REC123';
    const feeId = 1;

    mockApiUpdateFee.mockResolvedValueOnce({
      fee_id: feeId,
      recreation_fee_code: 'D',
      fee_amount: 10,
    });

    const { result } = renderHook(() => useUpdateFee(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId,
        feeId,
        fee_amount: 10,
      });
    });

    expect(mockApiUpdateFee).toHaveBeenCalledWith({
      recResourceId,
      feeId,
      updateRecreationFeeDto: {
        fee_amount: 10,
      },
    });
  });

  it('updates the fees query cache by replacing the updated fee', async () => {
    const recResourceId = 'REC123';
    const feeId = 1;
    const queryKey = RECREATION_RESOURCE_QUERY_KEYS.fees(recResourceId);

    queryClient.setQueryData(queryKey, [
      { fee_id: 1, fee_amount: 5 },
      { fee_id: 2, fee_amount: 20 },
    ]);

    mockApiUpdateFee.mockResolvedValueOnce({
      fee_id: feeId,
      recreation_fee_code: 'D',
      fee_amount: 10,
    });

    const { result } = renderHook(() => useUpdateFee(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId,
        feeId,
        fee_amount: 10,
      });
    });

    expect(queryClient.getQueryData(queryKey)).toEqual([
      { fee_id: 1, recreation_fee_code: 'D', fee_amount: 10 },
      { fee_id: 2, fee_amount: 20 },
    ]);
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Fee updated successfully',
      'updateFee-success',
    );
  });

  it('adds the fee when cache is empty or missing fee id', async () => {
    const recResourceId = 'REC123';
    const feeId = 999;
    const queryKey = RECREATION_RESOURCE_QUERY_KEYS.fees(recResourceId);

    queryClient.setQueryData(queryKey, [{ fee_id: 1, fee_amount: 5 }]);

    mockApiUpdateFee.mockResolvedValueOnce({
      fee_id: feeId,
      recreation_fee_code: 'T',
      fee_amount: 7,
    });

    const { result } = renderHook(() => useUpdateFee(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId,
        feeId,
        fee_amount: 7,
      });
    });

    expect(queryClient.getQueryData(queryKey)).toEqual([
      { fee_id: 1, fee_amount: 5 },
      { fee_id: 999, recreation_fee_code: 'T', fee_amount: 7 },
    ]);
  });

  it('shows conflict notification on 409', async () => {
    mockApiUpdateFee.mockRejectedValueOnce({
      response: { status: 409 },
    });

    const { result } = renderHook(() => useUpdateFee(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          recResourceId: 'REC123',
          feeId: 1,
          fee_amount: 10,
        }),
      ).rejects.toBeDefined();
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'This fee type already exists for this resource',
      'updateFee-conflict',
    );
  });

  it('shows not found notification on 404', async () => {
    mockApiUpdateFee.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const { result } = renderHook(() => useUpdateFee(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          recResourceId: 'REC123',
          feeId: 1,
          fee_amount: 10,
        }),
      ).rejects.toBeDefined();
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Fee not found',
      'updateFee-notfound',
    );
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBulkUpdateAssets } from '@/services/hooks/recreation-resource-admin/useBulkUpdateAssets';
import { useAssetsApiClient } from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { createRetryHandler } from '@/services';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

// Mock dependencies
vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({
    useAssetsApiClient: vi.fn(),
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/services', () => ({
  createRetryHandler: vi.fn(({ onFail }: { onFail: () => void }) => {
    // Expose onFail so it can be called directly in tests if needed
    return (_failureCount: number, _error: any) => {
      onFail();
      return false; // Stop retrying immediately for testing
    };
  }),
}));

vi.mock('./queryKeys', () => ({
  RECREATION_RESOURCE_QUERY_KEYS: {
    assets: (recResourceId: string) => [
      'recreation-resource',
      'assets',
      recResourceId,
    ],
  },
}));

describe('useBulkUpdateAssets', () => {
  let queryClient: QueryClient;
  const mockBulkUpdateRecreationAssets = vi.fn();

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAssetsApiClient as any).mockReturnValue({
      bulkUpdateRecreationAssets: mockBulkUpdateRecreationAssets,
    });
  });

  it('executes mutationFn and handles onSuccess with asset_ids present', async () => {
    const mockResponse = {
      rec_resource_id: 'rec-100',
      asset_ids: [10, 20, 30],
      update_fields: { asset_length: 15 },
    };

    mockBulkUpdateRecreationAssets.mockResolvedValueOnce(mockResponse);

    const invalidateQueriesSpy = vi.spyOn(
      QueryClient.prototype,
      'invalidateQueries',
    );

    const { result } = renderHook(() => useBulkUpdateAssets(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      recreationAssetBulkUpdateDto: mockResponse as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockBulkUpdateRecreationAssets).toHaveBeenCalledWith({
      recreationAssetBulkUpdateDto: mockResponse,
    });

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Assets 10, 20, 30 updated successfully',
      'bulkUpdateAssets-success',
    );

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('rec-100'),
    });
  });

  it('handles onSuccess fallback when asset_ids is missing/undefined', async () => {
    const mockResponse = {
      rec_resource_id: 'rec-200',
      update_fields: { asset_width: 5 },
    };

    mockBulkUpdateRecreationAssets.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBulkUpdateAssets(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      recreationAssetBulkUpdateDto: mockResponse as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Assets selected updated successfully',
      'bulkUpdateAssets-success',
    );
  });

  it('handles onError with custom error message', async () => {
    const mockError = { message: 'Custom API Failure' };
    mockBulkUpdateRecreationAssets.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useBulkUpdateAssets(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      recreationAssetBulkUpdateDto: { rec_resource_id: 'rec-300' } as any,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Custom API Failure',
      'bulkUpdateAssets-error',
    );
  });

  it('handles onError fallback message when error message is missing', async () => {
    const mockError = {}; // No message field
    mockBulkUpdateRecreationAssets.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useBulkUpdateAssets(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      recreationAssetBulkUpdateDto: { rec_resource_id: 'rec-400' } as any,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'This operation resulted in an error. The update was not successful.',
      'bulkUpdateAssets-error',
    );
  });

  it('triggers createRetryHandler onFail callback when retries fail', () => {
    renderHook(() => useBulkUpdateAssets(), {
      wrapper: createWrapper(),
    });

    // Extract onFail callback passed to createRetryHandler
    const createRetryHandlerMock = vi.mocked(createRetryHandler);
    expect(createRetryHandlerMock).toHaveBeenCalled();

    const configArg = createRetryHandlerMock.mock.calls[0][0] as {
      onFail: () => void;
    };

    // Execute onFail directly to verify notification invocation
    configArg.onFail();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update assets after multiple attempts. Please try again later.',
      'bulkUpdateAssets-retry-failed',
    );
  });
});

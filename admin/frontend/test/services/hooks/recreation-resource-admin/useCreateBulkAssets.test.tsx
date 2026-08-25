import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as AssetsApiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useCreateBulkAssets } from '@/services/hooks/recreation-resource-admin/useCreateBulkAssets';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({ useAssetsApiClient: vi.fn() }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useCreateBulkAssets', () => {
  const mockBulkCreate = vi.fn();
  const mockApi = { bulkCreateRecreationAssets: mockBulkCreate };
  const useAssetsApiClient = AssetsApiClientModule.useAssetsApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const assets = [
    {
      rec_resource_id: 'REC0001',
      asset_code: 100,
      asset_name: 'Bridge 1',
      asset_tag: 'bridge-01-REC0001',
    },
    {
      rec_resource_id: 'REC0001',
      asset_code: 100,
      asset_name: 'Bridge 2',
      asset_tag: 'bridge-02-REC0001',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAssetsApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('calls bulkCreateRecreationAssets with the provided assets', async () => {
    mockBulkCreate.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCreateBulkAssets(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({ recResourceId: 'REC0001', assets });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockBulkCreate).toHaveBeenCalledWith(assets);
  });

  it('shows a success notification with the asset count on success', async () => {
    mockBulkCreate.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCreateBulkAssets(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({ recResourceId: 'REC0001', assets });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).toHaveBeenCalledWith(
      '2 asset(s) created successfully',
      'bulkCreateAssets-success',
    );
  });

  it('invalidates the assets query for the correct recResourceId on success', async () => {
    mockBulkCreate.mockResolvedValueOnce(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateBulkAssets(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({ recResourceId: 'REC0001', assets });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC0001'),
    });
  });

  it('shows an error notification on failure', async () => {
    mockBulkCreate.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCreateBulkAssets(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({ recResourceId: 'REC0001', assets });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create assets. Please try again.',
      'bulkCreateAssets-error',
    );
  });

  it('configures a retry handler with an onFail callback', () => {
    renderHook(() => useCreateBulkAssets(), { wrapper: Wrapper });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it('calls addErrorNotification on retry failure via onFail', () => {
    let capturedOnFail: (() => void) | undefined;
    createRetryHandler.mockImplementation(
      ({ onFail }: { onFail: () => void }) => {
        capturedOnFail = onFail;
        return () => false;
      },
    );

    renderHook(() => useCreateBulkAssets(), { wrapper: Wrapper });

    capturedOnFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create assets after multiple attempts. Please try again later.',
      'bulkCreateAssets-error',
    );
  });
});

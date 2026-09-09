import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useDeleteAsset } from '@/services/hooks/recreation-resource-admin/useDeleteAsset';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({
    useAssetsApiClient: vi.fn(),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/helpers',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/services/hooks/recreation-resource-admin/helpers')
      >();
    return {
      ...actual,
      createRetryHandler: vi.fn(),
    };
  },
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useDeleteAsset', () => {
  const mockDeleteRecreationAsset = vi.fn();
  const mockApi = { deleteRecreationAsset: mockDeleteRecreationAsset };
  const mockRetryHandler = vi.fn();

  let queryClient: QueryClient;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClientModule.useAssetsApiClient).mockReturnValue(
      mockApi as any,
    );
    vi.mocked(createRetryHandler).mockReturnValue(mockRetryHandler as any);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('deletes the asset, updates the cache and invalidates the assets query on success', async () => {
    mockDeleteRecreationAsset.mockResolvedValueOnce(undefined);
    queryClient.setQueryData(RECREATION_RESOURCE_QUERY_KEYS.assets('REC001'), [
      { asset_id: 1 },
      { asset_id: 2 },
    ]);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteAsset(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ recResourceId: 'REC001', assetId: 1 });
    });

    expect(mockDeleteRecreationAsset).toHaveBeenCalledWith({ id: 1 });
    expect(
      queryClient.getQueryData(RECREATION_RESOURCE_QUERY_KEYS.assets('REC001')),
    ).toEqual([{ asset_id: 2 }]);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC001'),
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Asset deleted successfully.',
      'deleteAsset-success',
    );
  });

  it('configures the retry handler and surfaces the retry failure notification', () => {
    renderHook(() => useDeleteAsset(), { wrapper: Wrapper });

    expect(createRetryHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        onFail: expect.any(Function),
      }),
    );

    const onFail = vi.mocked(createRetryHandler).mock.calls[0]?.[0]?.onFail;
    onFail?.(new Error('boom'));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete asset after multiple attempts. Please try again later.',
      'deleteAsset-error',
    );
  });

  it('shows an error notification when the API call fails', async () => {
    mockDeleteRecreationAsset.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useDeleteAsset(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ recResourceId: 'REC001', assetId: 1 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete asset.',
      'deleteAsset-error',
    );
  });
});

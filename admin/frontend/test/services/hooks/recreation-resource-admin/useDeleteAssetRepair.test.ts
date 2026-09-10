import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useDeleteAssetRepair } from '@/services/hooks/recreation-resource-admin/useDeleteAssetRepair';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('useDeleteAssetRepair', () => {
  const mockDeleteAssetRepair = vi.fn();
  const mockApi = { deleteAssetRepair: mockDeleteAssetRepair };

  let queryClient: QueryClient;
  const Wrapper = ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClientModule.useAssetsApiClient).mockReturnValue(
      mockApi as any,
    );
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('deletes the repair and invalidates the assets query on success', async () => {
    mockDeleteAssetRepair.mockResolvedValueOnce(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteAssetRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        repairId: 7,
        recResourceId: 'REC001',
      });
    });

    expect(mockDeleteAssetRepair).toHaveBeenCalledWith({ repairId: 7 });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC001'),
    });
    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Repair deleted successfully.',
      'deleteRepair-success',
    );
  });

  it('shows an error notification when the API call fails', async () => {
    mockDeleteAssetRepair.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useDeleteAssetRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({ repairId: 7, recResourceId: 'REC001' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete repair.',
      'deleteRepair-error',
    );
  });
});

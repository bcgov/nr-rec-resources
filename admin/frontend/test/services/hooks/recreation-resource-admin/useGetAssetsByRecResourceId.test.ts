import { useGetAssetsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetAssetsByRecResourceId';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import * as notificationStore from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetPaginatedRecreationAssets = vi.fn();
const mockAddErrorNotification = vi.fn();

const mockApi = {
  getPaginatedRecreationAssets: mockGetPaginatedRecreationAssets,
};

describe('useGetAssetsByRecResourceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClientModule, 'useAssetsApiClient').mockReturnValue(
      mockApi as any,
    );
    vi.spyOn(notificationStore, 'addErrorNotification').mockImplementation(
      mockAddErrorNotification,
    );
  });

  it('returns empty initial data', () => {
    const { result } = renderHook(() => useGetAssetsByRecResourceId('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toEqual([]);
  });

  it('is disabled when recResourceId is not provided', () => {
    const { result } = renderHook(
      () => useGetAssetsByRecResourceId(undefined),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    expect(result.current.isPending).toBe(false);
    expect(mockGetPaginatedRecreationAssets).not.toHaveBeenCalled();
  });

  it('fetches assets with pagination, repair inclusion, and the given resource ID', async () => {
    const assets = [{ asset_id: 1, asset_name: 'Bridge' }];
    mockGetPaginatedRecreationAssets.mockResolvedValueOnce({
      data: assets,
      totalPages: 1,
    });

    const { result } = renderHook(() => useGetAssetsByRecResourceId('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.data).toEqual(assets));

    expect(mockGetPaginatedRecreationAssets).toHaveBeenCalledWith({
      recResourceId: 'REC123',
      page: 1,
      limit: 50,
      includeRepair: true,
    });
  });
});

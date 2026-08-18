import { useGetAssetCodes } from '@/services/hooks/recreation-resource-admin/useGetAssetCodes';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import * as notificationStore from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindAllAssetCodes = vi.fn();
const mockAddErrorNotification = vi.fn();

const mockApi = {
  recreationAssetControllerFindAllAssetCodes: mockFindAllAssetCodes,
};

describe('useGetAssetCodes', () => {
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
    const { result } = renderHook(() => useGetAssetCodes(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toEqual([]);
  });

  it('returns asset codes from the API on success', async () => {
    const codes = [{ asset_code: 100, description: 'Bridge' }];
    mockFindAllAssetCodes.mockResolvedValueOnce(codes);

    const { result } = renderHook(() => useGetAssetCodes(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.data).toEqual(codes));
  });
});

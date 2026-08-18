import { useGetRepairCodes } from '@/services/hooks/recreation-resource-admin/useGetRepairCodes';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import * as notificationStore from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindAllRepairCodes = vi.fn();
const mockAddErrorNotification = vi.fn();

const mockApi = {
  recreationAssetControllerFindAllRepairCodes: mockFindAllRepairCodes,
};

describe('useGetRepairCodes', () => {
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
    const { result } = renderHook(() => useGetRepairCodes(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toEqual([]);
  });

  it('returns repair codes from the API on success', async () => {
    const codes = [
      { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
    ];
    mockFindAllRepairCodes.mockResolvedValueOnce(codes);

    const { result } = renderHook(() => useGetRepairCodes(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.data).toEqual(codes));
  });
});

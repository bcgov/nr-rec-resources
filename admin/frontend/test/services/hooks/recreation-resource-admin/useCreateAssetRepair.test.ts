import { useCreateAssetRepair } from '@/services/hooks/recreation-resource-admin/useCreateAssetRepair';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateAssetRepair = vi.fn();
const mockApi = { createAssetRepair: mockCreateAssetRepair };

describe('useCreateAssetRepair', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClientModule, 'useAssetsApiClient').mockReturnValue(
      mockApi as any,
    );
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useCreateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('calls the API with correct parameters', async () => {
    const dto = {
      recreation_remed_repair_code: 'R1',
      estimated_repair_cost: 100,
      actual_repair_cost: null,
      repair_completed_date: null,
    };
    mockCreateAssetRepair.mockResolvedValueOnce({});

    const { result } = renderHook(() => useCreateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await result.current.mutateAsync({
        assetId: 42,
        recResourceId: 'REC001',
        dto,
      });
    });

    expect(mockCreateAssetRepair).toHaveBeenCalledWith({
      id: 42,
      createRecreationAssetRepairDto: dto,
    });
  });

  it('isPending is false initially', () => {
    const { result } = renderHook(() => useCreateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isPending).toBe(false);
  });
});

import { useUpdateAssetRepair } from '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateAssetRepair = vi.fn();
const mockApi = { updateAssetRepair: mockUpdateAssetRepair };

describe('useUpdateAssetRepair', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClientModule, 'useAssetsApiClient').mockReturnValue(
      mockApi as any,
    );
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('calls the API with correct parameters', async () => {
    const dto = { estimated_repair_cost: 250 };
    mockUpdateAssetRepair.mockResolvedValueOnce({});

    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await result.current.mutateAsync({
        repairId: 7,
        recResourceId: 'REC001',
        dto,
      });
    });

    expect(mockUpdateAssetRepair).toHaveBeenCalledWith({
      repairId: 7,
      updateRecreationAssetRepairDto: dto,
    });
  });

  it('isPending is false initially', () => {
    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isPending).toBe(false);
  });
});

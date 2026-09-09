import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useUpdateAssetRepair } from '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

const mockUpdateAssetRepair = vi.fn();
const mockApi = { updateAssetRepair: mockUpdateAssetRepair };

describe('useUpdateAssetRepair', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClientModule, 'useAssetsApiClient').mockReturnValue(
      mockApi as any,
    );
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });
  const Wrapper = ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: Wrapper,
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
      wrapper: Wrapper,
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

  it('invalidates the assets query on success', async () => {
    mockUpdateAssetRepair.mockResolvedValueOnce({});
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        repairId: 7,
        recResourceId: 'REC001',
        dto: { estimated_repair_cost: 250 },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC001'),
    });
  });

  it('shows an error notification when the API call fails', async () => {
    mockUpdateAssetRepair.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        repairId: 7,
        recResourceId: 'REC001',
        dto: { estimated_repair_cost: 250 },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update repair.',
      'updateRepair-error',
    );
  });

  it('isPending is false initially', () => {
    const { result } = renderHook(() => useUpdateAssetRepair(), {
      wrapper: Wrapper,
    });

    expect(result.current.isPending).toBe(false);
  });
});

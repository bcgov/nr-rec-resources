import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as AssetsApiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useUpdateRepair } from '@/services/hooks/recreation-resource-admin/useUpdateRepair';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({ useAssetsApiClient: vi.fn() }),
);

describe('useUpdateRepair', () => {
  const mockUpdateAssetRepair = vi.fn();
  const mockApi = { updateAssetRepair: mockUpdateAssetRepair };
  const useAssetsApiClient = AssetsApiClientModule.useAssetsApiClient as any;

  let queryClient: QueryClient;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    useAssetsApiClient.mockReturnValue(mockApi);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('calls updateAssetRepair with the correct parameters', async () => {
    mockUpdateAssetRepair.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        repairId: 7,
        recResourceId: 'REC0001',
        dto: {
          recreation_remed_repair_code: 'R1',
          estimated_repair_cost: 500,
          actual_repair_cost: null,
          repair_completed_date: null,
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateAssetRepair).toHaveBeenCalledWith({
      repairId: 7,
      updateRecreationAssetRepairDto: {
        recreation_remed_repair_code: 'R1',
        estimated_repair_cost: 500,
        actual_repair_cost: null,
        repair_completed_date: null,
      },
    });
  });

  it('invalidates the assets query for the correct recResourceId on success', async () => {
    mockUpdateAssetRepair.mockResolvedValueOnce(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        repairId: 7,
        recResourceId: 'REC0001',
        dto: { recreation_remed_repair_code: 'R1' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC0001'),
    });
  });

  it('sets isError to true when the API call fails', async () => {
    mockUpdateAssetRepair.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUpdateRepair(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate({
        repairId: 7,
        recResourceId: 'REC0001',
        dto: {},
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

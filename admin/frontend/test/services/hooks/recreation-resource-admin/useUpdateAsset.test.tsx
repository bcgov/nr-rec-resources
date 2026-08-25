import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as AssetsApiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useUpdateAsset } from '@/services/hooks/recreation-resource-admin/useUpdateAsset';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({ useAssetsApiClient: vi.fn() }),
);

describe('useUpdateAsset', () => {
  const mockUpdateRecreationAsset = vi.fn();
  const mockApi = { updateRecreationAsset: mockUpdateRecreationAsset };
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

  it('calls updateRecreationAsset with the correct parameters', async () => {
    mockUpdateRecreationAsset.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUpdateAsset(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        assetId: 42,
        recResourceId: 'REC0001',
        dto: { asset_name: 'Updated Bridge' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateRecreationAsset).toHaveBeenCalledWith({
      id: 42,
      updateRecreationAssetDto: { asset_name: 'Updated Bridge' },
    });
  });

  it('invalidates the assets query for the correct recResourceId on success', async () => {
    mockUpdateRecreationAsset.mockResolvedValueOnce(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateAsset(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        assetId: 42,
        recResourceId: 'REC0001',
        dto: { asset_name: 'Updated Bridge' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC0001'),
    });
  });

  it('sets isError to true when the API call fails', async () => {
    mockUpdateRecreationAsset.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useUpdateAsset(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        assetId: 42,
        recResourceId: 'REC0001',
        dto: {},
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

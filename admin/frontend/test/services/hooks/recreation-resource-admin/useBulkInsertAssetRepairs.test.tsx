import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as AssetsApiClientModule from '@/services/hooks/recreation-resource-admin/useAssetsApiClient';
import { useBulkInsertAssetRepairs } from '@/services/hooks/recreation-resource-admin/useBulkInsertAssetRepairs';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useAssetsApiClient',
  () => ({
    useAssetsApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useBulkInsertAssetRepairs', () => {
  const mockBulkInsertAssetRepairs = vi.fn();
  const mockApi = {
    bulkInsertAssetRepairs: mockBulkInsertAssetRepairs,
  };

  const useAssetsApiClient = AssetsApiClientModule.useAssetsApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const dto = {
    recreation_remed_repair_code: 'R1',
    completed_date: undefined,
    changes: [
      {
        estimated_repair_cost: 100,
        actual_repair_cost: undefined,
        asset_ids: [1],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAssetsApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('calls the API with the correct parameters', async () => {
    mockBulkInsertAssetRepairs.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBulkInsertAssetRepairs(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ recResourceId: 'REC0001', dto });
    });

    expect(mockBulkInsertAssetRepairs).toHaveBeenCalledWith({
      recreationAssetBulkRepairDto: dto,
    });
  });

  it('shows a success notification and invalidates the assets query on success', async () => {
    mockBulkInsertAssetRepairs.mockResolvedValueOnce(undefined);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useBulkInsertAssetRepairs(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ recResourceId: 'REC0001', dto });
    });

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Repairs added successfully',
      'bulkInsertAssetRepairs-success',
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.assets('REC0001'),
    });
  });

  it('shows a not-found notification on 404', async () => {
    mockBulkInsertAssetRepairs.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const { result } = renderHook(() => useBulkInsertAssetRepairs(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ recResourceId: 'REC0001', dto }),
      ).rejects.toBeDefined();
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'One or more selected assets could not be found',
      'bulkInsertAssetRepairs-notfound',
    );
  });

  it('shows a bad-request notification on 400', async () => {
    mockBulkInsertAssetRepairs.mockRejectedValueOnce({
      response: { status: 400 },
    });

    const { result } = renderHook(() => useBulkInsertAssetRepairs(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ recResourceId: 'REC0001', dto }),
      ).rejects.toBeDefined();
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Invalid repair details. Please check the form and try again',
      'bulkInsertAssetRepairs-badrequest',
    );
  });

  it('does not show a notification for other status codes', async () => {
    mockBulkInsertAssetRepairs.mockRejectedValueOnce({
      response: { status: 500 },
    });

    const { result } = renderHook(() => useBulkInsertAssetRepairs(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ recResourceId: 'REC0001', dto }),
      ).rejects.toBeDefined();
    });

    expect(addErrorNotification).not.toHaveBeenCalled();
  });

  it('configures a retry handler', () => {
    renderHook(() => useBulkInsertAssetRepairs(), { wrapper: Wrapper });

    expect(createRetryHandler).toHaveBeenCalled();
  });
});

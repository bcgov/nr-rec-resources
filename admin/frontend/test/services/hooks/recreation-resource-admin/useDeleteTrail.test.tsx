import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useDeleteTrail } from '@/services/hooks/recreation-resource-admin/useDeleteTrail';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({ useRecreationResourceAdminApiClient: vi.fn() }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useDeleteTrail', () => {
  const mockDeleteTrail = vi.fn();
  const mockApi = { deleteTrail: mockDeleteTrail };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  const deleteRequest = { recResourceId: 'REC0001', trailId: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('should call api.deleteTrail with correct parameters', async () => {
    mockDeleteTrail.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(deleteRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteTrail).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      trailId: 1,
    });
  });

  it('should show success notification on success', async () => {
    mockDeleteTrail.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(deleteRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Trail deleted successfully',
      'deleteTrail-success',
    );
  });

  it('should remove deleted trail from query cache', async () => {
    mockDeleteTrail.mockResolvedValueOnce(undefined);

    const existingTrails = [
      { recreation_activity_code_trails_id: 1, name: 'Trail A' },
      { recreation_activity_code_trails_id: 2, name: 'Trail B' },
    ];

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(
      ['recreation-resource-admin', 'trails', 'REC0001'],
      existingTrails,
    );

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteTrail(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(deleteRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ['recreation-resource-admin', 'trails', 'REC0001'],
      expect.any(Function),
    );
  });

  it('should show error notification on failure', async () => {
    mockDeleteTrail.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useDeleteTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(deleteRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete trail',
      'deleteTrail-error',
    );
  });

  it('should call createRetryHandler with an onFail callback', () => {
    renderHook(() => useDeleteTrail(), { wrapper: TestQueryClientProvider });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it('should call addErrorNotification on retry failure', () => {
    let capturedOnFail: (() => void) | undefined;
    createRetryHandler.mockImplementation(
      ({ onFail }: { onFail: () => void }) => {
        capturedOnFail = onFail;
        return () => false;
      },
    );

    renderHook(() => useDeleteTrail(), { wrapper: TestQueryClientProvider });

    capturedOnFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete trail after multiple attempts. Please try again later.',
      'deleteTrail-error',
    );
  });
});

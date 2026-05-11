import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useUpdateTrail } from '@/services/hooks/recreation-resource-admin/useUpdateTrail';
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

describe('useUpdateTrail', () => {
  const mockUpdateTrail = vi.fn();
  const mockApi = { updateTrail: mockUpdateTrail };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  const existingTrail = {
    recreation_activity_code_trails_id: 1,
    recreation_activity_code: 34,
    trail_type: 'BLUE',
    name: 'Old Name',
  };

  const updatedTrail = { ...existingTrail, name: 'New Name' };

  const updateRequest = {
    recResourceId: 'REC0001',
    trailId: 1,
    name: 'New Name',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('should call api.updateTrail with correct parameters', async () => {
    mockUpdateTrail.mockResolvedValueOnce(updatedTrail);

    const { result } = renderHook(() => useUpdateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(updateRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateTrail).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      trailId: 1,
      updateTrailDto: { name: 'New Name' },
    });
  });

  it('should show success notification on success', async () => {
    mockUpdateTrail.mockResolvedValueOnce(updatedTrail);

    const { result } = renderHook(() => useUpdateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(updateRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Trail updated successfully',
      'updateTrail-success',
    );
  });

  it('should update query cache on success — replaces existing trail', async () => {
    mockUpdateTrail.mockResolvedValueOnce(updatedTrail);

    const queryClient: QueryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const Wrapper2 = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    queryClient.setQueryData(
      ['recreation-resource-admin', 'trails', 'REC0001'],
      [existingTrail],
    );

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    const { result } = renderHook(() => useUpdateTrail(), {
      wrapper: Wrapper2,
    });

    await act(async () => {
      result.current.mutate(updateRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ['recreation-resource-admin', 'trails', 'REC0001'],
      expect.any(Function),
    );
  });

  it('should show error notification on failure', async () => {
    mockUpdateTrail.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useUpdateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(updateRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update trail',
      'updateTrail-error',
    );
  });

  it('should call createRetryHandler with an onFail callback', () => {
    renderHook(() => useUpdateTrail(), { wrapper: TestQueryClientProvider });

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

    renderHook(() => useUpdateTrail(), { wrapper: TestQueryClientProvider });

    capturedOnFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to update trail after multiple attempts. Please try again later.',
      'updateTrail-error',
    );
  });
});

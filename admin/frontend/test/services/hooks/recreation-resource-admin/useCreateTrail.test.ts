import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useCreateTrail } from '@/services/hooks/recreation-resource-admin/useCreateTrail';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';

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

describe('useCreateTrail', () => {
  const mockCreateTrail = vi.fn();
  const mockApi = { createTrail: mockCreateTrail };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  const mockTrail = {
    recreation_activity_code_trails_id: 1,
    recreation_activity_code: 34,
    trail_type: 'BLUE',
    name: 'New Trail',
  };

  const createRequest = {
    recResourceId: 'REC0001',
    recreation_activity_code: 34,
    trail_type: 'BLUE' as const,
    name: 'New Trail',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('should call api.createTrail with correct parameters', async () => {
    mockCreateTrail.mockResolvedValueOnce(mockTrail);

    const { result } = renderHook(() => useCreateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(createRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockCreateTrail).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      createTrailDto: {
        recreation_activity_code: 34,
        trail_type: 'BLUE',
        name: 'New Trail',
      },
    });
  });

  it('should show success notification on success', async () => {
    mockCreateTrail.mockResolvedValueOnce(mockTrail);

    const { result } = renderHook(() => useCreateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(createRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addSuccessNotification).toHaveBeenCalledWith(
      'Trail created successfully',
      'createTrail-success',
    );
  });

  it('should show error notification on failure', async () => {
    mockCreateTrail.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useCreateTrail(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(createRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create trail',
      'createTrail-error',
    );
  });

  it('should call createRetryHandler with an onFail callback', () => {
    renderHook(() => useCreateTrail(), { wrapper: TestQueryClientProvider });

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

    renderHook(() => useCreateTrail(), { wrapper: TestQueryClientProvider });

    capturedOnFail?.();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to create trail after multiple attempts. Please try again later.',
      'createTrail-error',
    );
  });
});

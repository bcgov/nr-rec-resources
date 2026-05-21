import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useDeleteFee } from '@/services/hooks/recreation-resource-admin/useDeleteFee';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook } from '@testing-library/react';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock(
  '@/services/hooks/recreation-resource-admin/helpers',
  async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
      ...actual,
      createRetryHandler: vi.fn(),
    };
  },
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

describe('useDeleteFee', () => {
  const mockApi = {
    deleteRecreationResourceFee: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useDeleteFee(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('calls the API with correct parameters', async () => {
    const request = {
      recResourceId: 'REC123',
      feeId: 77,
    };

    mockApi.deleteRecreationResourceFee.mockResolvedValue({ fee_id: 77 });

    const { result } = renderHook(() => useDeleteFee(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await result.current.mutateAsync(request);
    });

    expect(mockApi.deleteRecreationResourceFee).toHaveBeenCalledWith(request);
  });

  it('configures retry handler', () => {
    renderHook(() => useDeleteFee(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('calls addErrorNotification when retry onFail is triggered', () => {
    renderHook(() => useDeleteFee(), {
      wrapper: TestQueryClientProvider,
    });

    const onFailCallback = (createRetryHandler as any).mock.calls[0][0].onFail;
    onFailCallback();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to delete fee after multiple attempts. Please try again later.',
      'deleteFee-error',
    );
  });

  it('calls addErrorNotification when API responds with 404', async () => {
    const request = {
      recResourceId: 'REC404',
      feeId: 99,
    };

    mockApi.deleteRecreationResourceFee.mockRejectedValue({
      response: { status: 404 },
    });

    const { result } = renderHook(() => useDeleteFee(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(request)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Fee not found',
      'deleteFee-notfound',
    );
  });
});

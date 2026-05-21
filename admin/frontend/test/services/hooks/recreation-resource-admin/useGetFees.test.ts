import { useGetFees } from '@/services/hooks/recreation-resource-admin/useGetFees';
import { addErrorNotification } from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  createRetryHandler,
  mapRecreationFee,
} from '@/services/hooks/recreation-resource-admin/helpers';
import { useRecreationResourceAdminApiClient } from '@/services';

vi.mock('@/services', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useRecreationResourceAdminApiClient: vi.fn(),
  };
});

vi.mock(
  '@/services/hooks/recreation-resource-admin/helpers',
  async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
      ...actual,
      createRetryHandler: vi.fn(),
      mapRecreationFee: vi.fn((fee: any) => fee),
    };
  },
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

describe('useGetFees', () => {
  const mockApi = {
    getRecreationResourceFees: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(() => false);
  });

  it('returns empty initial data', () => {
    const { result } = renderHook(() => useGetFees('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toEqual([]);
  });

  it('is disabled when recResourceId is not provided', () => {
    const { result } = renderHook(() => useGetFees(undefined), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isPending).toBe(false);
    expect(mockApi.getRecreationResourceFees).not.toHaveBeenCalled();
  });

  it('calls API and maps fee data when recResourceId is provided', async () => {
    const apiFee = { fee_id: 11, recreation_fee_code: 'DAY' };
    const mappedFee = { fee_id: 11, recreation_fee_code: 'DAY', mapped: true };

    mockApi.getRecreationResourceFees.mockResolvedValueOnce([apiFee]);
    (mapRecreationFee as Mock).mockReturnValueOnce(mappedFee);

    const { result } = renderHook(() => useGetFees('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([mappedFee]);
    });

    expect(mockApi.getRecreationResourceFees).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
    expect(mapRecreationFee).toHaveBeenCalledTimes(1);
    expect((mapRecreationFee as Mock).mock.calls[0][0]).toEqual(apiFee);
  });

  it('configures retry handler with onFail notification callback', () => {
    renderHook(() => useGetFees('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it('calls addErrorNotification when retry onFail executes', () => {
    renderHook(() => useGetFees('REC123'), {
      wrapper: TestQueryClientProvider,
    });

    const onFailCallback = (createRetryHandler as any).mock.calls[0][0].onFail;
    onFailCallback();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load fees after multiple attempts. Please try again later.',
      'getFees-error',
    );
  });
});

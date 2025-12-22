import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useCreateFee } from '@/services/hooks/recreation-resource-admin/useCreateFee';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
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
      mapRecreationFee: vi.fn((fee: any) => fee),
    };
  },
);

describe('useCreateFee', () => {
  const mockApi = {
    createRecreationResourceFee: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useCreateFee(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
    });
  });

  it('calls the API with correct parameters', async () => {
    const recResourceId = 'rec-123';
    const feeData = {
      recResourceId,
      recreation_fee_code: 'TYPE_A',
      fee_amount: 100,
    };

    const newFee = {
      id: 'fee-1',
      ...feeData,
    };

    mockApi.createRecreationResourceFee.mockResolvedValue(newFee);

    const { result } = renderHook(() => useCreateFee(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await result.current.mutateAsync(feeData);
    });

    expect(mockApi.createRecreationResourceFee).toHaveBeenCalledWith({
      recResourceId,
      createRecreationFeeDto: {
        recreation_fee_code: feeData.recreation_fee_code,
        fee_amount: feeData.fee_amount,
      },
    });
  });

  it('configures retry handler', () => {
    renderHook(() => useCreateFee(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('uses the API client for mutation', () => {
    renderHook(() => useCreateFee(), {
      wrapper: TestQueryClientProvider,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });
});

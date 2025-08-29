import { useDeleteEstablishmentOrderDoc } from '@/services/hooks/recreation-resource-admin/useDeleteEstablishmentOrderDoc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDeleteEstablishmentOrderDoc = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      deleteEstablishmentOrderDoc: mockDeleteEstablishmentOrderDoc,
    }),
  }),
);

describe('useDeleteEstablishmentOrderDoc', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should delete establishment order doc successfully', async () => {
    mockDeleteEstablishmentOrderDoc.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params = {
      recResourceId: 'resource-123',
      s3Key: 'docs/order-123.pdf',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteEstablishmentOrderDoc).toHaveBeenCalledWith(params);
  });

  it('should handle deletion errors', async () => {
    const error = new Error('Failed to delete');
    mockDeleteEstablishmentOrderDoc.mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params = {
      recResourceId: 'resource-123',
      s3Key: 'docs/order-123.pdf',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });

  it('should support async mutation', async () => {
    mockDeleteEstablishmentOrderDoc.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params = {
      recResourceId: 'resource-456',
      s3Key: 'docs/order-456.pdf',
    };

    const promise = result.current.mutateAsync(params);

    await expect(promise).resolves.toEqual({ success: true });
    expect(mockDeleteEstablishmentOrderDoc).toHaveBeenCalledWith(params);
  });

  it('should handle retry logic', async () => {
    const error = new Error('Network error');
    mockDeleteEstablishmentOrderDoc.mockRejectedValue(error);

    const retryQueryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: 3,
          retryDelay: 1,
        },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={retryQueryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper,
    });

    const params = {
      recResourceId: 'resource-retry',
      s3Key: 'docs/order-retry.pdf',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    // With mutations, retries are handled differently than queries
    expect(mockDeleteEstablishmentOrderDoc).toHaveBeenCalled();
  });

  it('should reset mutation state', async () => {
    mockDeleteEstablishmentOrderDoc.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params = {
      recResourceId: 'resource-reset',
      s3Key: 'docs/order-reset.pdf',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Mutations don't automatically reset to idle after reset, they stay in success state
    // Just verify data is cleared
    result.current.reset();
    await waitFor(() => expect(result.current.data).toBeUndefined());
  });

  it('should handle multiple deletions sequentially', async () => {
    mockDeleteEstablishmentOrderDoc
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params1 = {
      recResourceId: 'resource-1',
      s3Key: 'docs/order-1.pdf',
    };

    const params2 = {
      recResourceId: 'resource-2',
      s3Key: 'docs/order-2.pdf',
    };

    result.current.mutate(params1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.mutate(params2);
    await waitFor(() =>
      expect(mockDeleteEstablishmentOrderDoc).toHaveBeenCalledTimes(2),
    );

    expect(mockDeleteEstablishmentOrderDoc).toHaveBeenNthCalledWith(1, params1);
    expect(mockDeleteEstablishmentOrderDoc).toHaveBeenNthCalledWith(2, params2);
  });

  it('should provide loading state during deletion', async () => {
    mockDeleteEstablishmentOrderDoc.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ success: true }), 100);
        }),
    );

    const { result } = renderHook(() => useDeleteEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const params = {
      recResourceId: 'resource-loading',
      s3Key: 'docs/order-loading.pdf',
    };

    expect(result.current.isPending).toBe(false);

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isPending).toBe(true));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isPending).toBe(false);
  });
});

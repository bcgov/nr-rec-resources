import { useGetEstablishmentOrderDocs } from '@/services/hooks/recreation-resource-admin/useGetEstablishmentOrderDocs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetAllEstablishmentOrderDocs = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      getAllEstablishmentOrderDocs: mockGetAllEstablishmentOrderDocs,
    }),
  }),
);

describe('useGetEstablishmentOrderDocs', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch establishment order docs successfully', async () => {
    const mockDocs = [
      { id: '1', title: 'Doc 1', s3_key: 'key1' },
      { id: '2', title: 'Doc 2', s3_key: 'key2' },
    ];
    mockGetAllEstablishmentOrderDocs.mockResolvedValue(mockDocs);

    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs('resource-123'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDocs);
    expect(mockGetAllEstablishmentOrderDocs).toHaveBeenCalledWith({
      recResourceId: 'resource-123',
    });
  });

  it('should not fetch when rec_resource_id is undefined', () => {
    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetAllEstablishmentOrderDocs).not.toHaveBeenCalled();
  });

  it('should not fetch when rec_resource_id is empty string', () => {
    const { result } = renderHook(() => useGetEstablishmentOrderDocs(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetAllEstablishmentOrderDocs).not.toHaveBeenCalled();
  });

  it('should handle error when rec_resource_id is provided in queryFn but undefined in enabled check', async () => {
    mockGetAllEstablishmentOrderDocs.mockRejectedValue(
      new Error('rec_resource_id is required'),
    );

    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs('resource-123'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(
      new Error('rec_resource_id is required'),
    );
  });

  it('should use correct query key', async () => {
    mockGetAllEstablishmentOrderDocs.mockResolvedValue([]);

    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs('resource-456'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cachedData = queryClient.getQueryData([
      'establishment-order-docs',
      'resource-456',
    ]);
    expect(cachedData).toEqual([]);
  });

  it('should refetch when rec_resource_id changes', async () => {
    const docs1 = [{ id: '1', title: 'Doc 1', s3_key: 'key1' }];
    const docs2 = [{ id: '2', title: 'Doc 2', s3_key: 'key2' }];

    mockGetAllEstablishmentOrderDocs
      .mockResolvedValueOnce(docs1)
      .mockResolvedValueOnce(docs2);

    const { result, rerender } = renderHook(
      ({ resourceId }: { resourceId?: string }) =>
        useGetEstablishmentOrderDocs(resourceId),
      {
        wrapper: createWrapper(),
        initialProps: { resourceId: 'resource-1' },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(docs1);

    // Change the resource ID
    rerender({ resourceId: 'resource-2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() =>
      expect(mockGetAllEstablishmentOrderDocs).toHaveBeenCalledTimes(2),
    );

    // Need to wait for the query to update
    await waitFor(() => expect(result.current.data).toEqual(docs2), {
      timeout: 3000,
    });
  });

  it('should return empty array when no docs exist', async () => {
    mockGetAllEstablishmentOrderDocs.mockResolvedValue([]);

    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs('resource-empty'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network error');
    mockGetAllEstablishmentOrderDocs.mockRejectedValue(networkError);

    const { result } = renderHook(
      () => useGetEstablishmentOrderDocs('resource-error'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(networkError);
  });
});

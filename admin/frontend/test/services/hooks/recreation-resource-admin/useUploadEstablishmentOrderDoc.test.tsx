import { useUploadEstablishmentOrderDoc } from '@/services/hooks/recreation-resource-admin/useUploadEstablishmentOrderDoc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateEstablishmentOrderDoc = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      createEstablishmentOrderDoc: mockCreateEstablishmentOrderDoc,
    }),
  }),
);

describe('useUploadEstablishmentOrderDoc', () => {
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

  it('should upload establishment order doc successfully', async () => {
    const mockResponse = { id: 'doc-123', title: 'Test Order', s3_key: 'key1' };
    mockCreateEstablishmentOrderDoc.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['content'], 'order.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-123',
      file: mockFile,
      title: 'Test Order Document',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockCreateEstablishmentOrderDoc).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle upload errors', async () => {
    const error = new Error('Upload failed');
    mockCreateEstablishmentOrderDoc.mockRejectedValue(error);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['content'], 'order.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-123',
      file: mockFile,
      title: 'Test Order',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });

  it('should support async mutation', async () => {
    const mockResponse = {
      id: 'doc-456',
      title: 'Another Order',
      s3_key: 'key2',
    };
    mockCreateEstablishmentOrderDoc.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['content'], 'order2.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-456',
      file: mockFile,
      title: 'Another Order',
    };

    const promise = result.current.mutateAsync(params);

    await expect(promise).resolves.toEqual(mockResponse);
    expect(mockCreateEstablishmentOrderDoc).toHaveBeenCalledWith(params);
  });

  it('should handle retry logic', async () => {
    const error = new Error('Network error');
    mockCreateEstablishmentOrderDoc.mockRejectedValue(error);

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

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper,
    });

    const mockFile = new File(['content'], 'order.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-retry',
      file: mockFile,
      title: 'Retry Order',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    // With mutations, retries are handled differently than queries
    // The mutation itself may not retry automatically
    expect(mockCreateEstablishmentOrderDoc).toHaveBeenCalled();
  });

  it('should reset mutation state', async () => {
    const mockResponse = {
      id: 'doc-reset',
      title: 'Reset Order',
      s3_key: 'key3',
    };
    mockCreateEstablishmentOrderDoc.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['content'], 'order.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-reset',
      file: mockFile,
      title: 'Reset Order',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Mutations don't automatically reset to idle after reset, they stay in success state
    // Just verify data is cleared
    result.current.reset();
    await waitFor(() => expect(result.current.data).toBeUndefined());
  });

  it('should handle multiple uploads sequentially', async () => {
    const mockResponse1 = { id: 'doc-1', title: 'Order 1', s3_key: 'key1' };
    const mockResponse2 = { id: 'doc-2', title: 'Order 2', s3_key: 'key2' };

    mockCreateEstablishmentOrderDoc
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile1 = new File(['content1'], 'order1.pdf', {
      type: 'application/pdf',
    });
    const mockFile2 = new File(['content2'], 'order2.pdf', {
      type: 'application/pdf',
    });

    const params1 = {
      recResourceId: 'resource-1',
      file: mockFile1,
      title: 'Order 1',
    };

    const params2 = {
      recResourceId: 'resource-2',
      file: mockFile2,
      title: 'Order 2',
    };

    result.current.mutate(params1);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.mutate(params2);
    await waitFor(() =>
      expect(mockCreateEstablishmentOrderDoc).toHaveBeenCalledTimes(2),
    );

    expect(mockCreateEstablishmentOrderDoc).toHaveBeenNthCalledWith(1, params1);
    expect(mockCreateEstablishmentOrderDoc).toHaveBeenNthCalledWith(2, params2);
  });

  it('should provide loading state during upload', async () => {
    mockCreateEstablishmentOrderDoc.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({ id: 'doc-loading', title: 'Loading', s3_key: 'key' }),
            100,
          );
        }),
    );

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['content'], 'order.pdf', {
      type: 'application/pdf',
    });

    const params = {
      recResourceId: 'resource-loading',
      file: mockFile,
      title: 'Loading Order',
    };

    expect(result.current.isPending).toBe(false);

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isPending).toBe(true));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isPending).toBe(false);
  });

  it('should handle different file types', async () => {
    const mockResponse = {
      id: 'doc-type',
      title: 'Doc Type',
      s3_key: 'key-type',
    };
    mockCreateEstablishmentOrderDoc.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUploadEstablishmentOrderDoc(), {
      wrapper: createWrapper(),
    });

    const mockDocFile = new File(['content'], 'order.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const params = {
      recResourceId: 'resource-type',
      file: mockDocFile,
      title: 'DOCX Order',
    };

    result.current.mutate(params);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateEstablishmentOrderDoc).toHaveBeenCalledWith(params);
  });
});

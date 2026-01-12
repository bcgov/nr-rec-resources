import * as helpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useDeleteResourceDocument } from '@/services/hooks/recreation-resource-admin/useDeleteResourceDocument';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RecreationResourceApi } from '@/services/recreation-resource-admin/apis/RecreationResourceApi';
import { TestQueryClientProvider } from '@test/test-utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

const mockDeleteDocumentResource = vi.fn();
const mockRetryHandler = vi.fn();

const mockApi: Partial<RecreationResourceApi> = {
  deleteDocumentResource: mockDeleteDocumentResource,
};

describe('useDeleteResourceDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      apiClientModule.useRecreationResourceAdminApiClient as any
    ).mockReturnValue(mockApi);
    (helpersModule.createRetryHandler as any).mockReturnValue(mockRetryHandler);
  });

  it('returns a mutation object with expected properties', () => {
    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toMatchObject({
      mutate: expect.any(Function),
      mutateAsync: expect.any(Function),
      isPending: expect.any(Boolean),
      isError: expect.any(Boolean),
      isSuccess: expect.any(Boolean),
      error: null,
      data: undefined,
    });
  });

  it('calls deleteDocumentResource with correct params', async () => {
    const params = {
      recResourceId: 'test-resource-123',
      documentId: 'test-document-456',
    };

    mockDeleteDocumentResource.mockResolvedValueOnce({
      success: true,
    });

    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await result.current.mutateAsync(params);
    });

    expect(mockDeleteDocumentResource).toHaveBeenCalledWith({
      recResourceId: 'test-resource-123',
      documentId: 'test-document-456',
    });
    expect(mockDeleteDocumentResource).toHaveBeenCalledTimes(1);
  });

  it('returns response from deleteDocumentResource', async () => {
    const params = {
      recResourceId: 'test-resource-123',
      documentId: 'test-document-456',
    };

    const mockResponse = { success: true, id: 'test-document-456' };
    mockDeleteDocumentResource.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    let response;
    await act(async () => {
      response = await result.current.mutateAsync(params);
    });

    expect(response).toEqual(mockResponse);
  });

  it('throws error when deleteDocumentResource fails', async () => {
    const params = {
      recResourceId: 'test-resource-123',
      documentId: 'test-document-456',
    };

    const mockError = new Error('Delete failed');
    mockDeleteDocumentResource.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  it('configures retry handler', () => {
    renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    expect(helpersModule.createRetryHandler).toHaveBeenCalled();
  });

  it('starts with isPending false', () => {
    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isPending).toBe(false);
  });

  it('handles network errors gracefully', async () => {
    const params = {
      recResourceId: 'test-resource-123',
      documentId: 'test-document-456',
    };

    const networkError = new Error('Network Error');
    networkError.name = 'NetworkError';
    mockDeleteDocumentResource.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useDeleteResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Network Error',
      );
    });
  });
});

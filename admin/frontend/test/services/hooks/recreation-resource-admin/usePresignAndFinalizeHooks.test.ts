import {
  usePresignImageUpload,
  useFinalizeImageUpload,
  usePresignDocUpload,
  useFinalizeDocUpload,
  PresignImageUploadParams,
  FinalizeImageUploadParams,
  PresignDocUploadParams,
  FinalizeDocUploadParams,
} from '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(() => ({
    authService: {
      getToken: vi.fn().mockResolvedValue('mock-token'),
    },
  })),
}));

describe('usePresignAndFinalizeHooks', () => {
  const mockApi = {
    presignImageUpload: vi.fn(),
    finalizeImageUpload: vi.fn(),
    presignDocUpload: vi.fn(),
    finalizeDocUpload: vi.fn(),
  };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  describe('usePresignImageUpload', () => {
    it('returns a mutation object with expected properties', () => {
      const { result } = renderHook(() => usePresignImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.presignImageUpload with correct parameters', async () => {
      const params: PresignImageUploadParams = {
        recResourceId: 'rec-123',
        fileName: 'test-image.webp',
      };

      const mockResponse = {
        image_id: 'img-123',
        presigned_urls: [
          {
            size_code: 'original',
            url: 'https://s3.example.com/original',
            key: 'key-original',
          },
          {
            size_code: 'scr',
            url: 'https://s3.example.com/scr',
            key: 'key-scr',
          },
        ],
      };

      mockApi.presignImageUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePresignImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.presignImageUpload).toHaveBeenCalledWith(params);
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const params: PresignImageUploadParams = {
        recResourceId: 'rec-123',
        fileName: 'test-image.webp',
      };

      const error = new Error('Presign failed');
      mockApi.presignImageUpload.mockRejectedValue(error);

      const { result } = renderHook(() => usePresignImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Presign failed',
      );
    });
  });

  describe('useFinalizeImageUpload', () => {
    it('returns a mutation object with expected properties', () => {
      const { result } = renderHook(() => useFinalizeImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.finalizeImageUpload with correct parameters', async () => {
      const params: FinalizeImageUploadParams = {
        recResourceId: 'rec-123',
        image_id: 'img-123',
        file_name: 'test-image',
        file_size_original: 1000,
        file_size_scr: 500,
        file_size_pre: 300,
        file_size_thm: 100,
      };

      const mockResponse = { id: 'img-123', ...params };
      mockApi.finalizeImageUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFinalizeImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.finalizeImageUpload).toHaveBeenCalledWith({
        recResourceId: 'rec-123',
        imageId: 'img-123',
        fileName: 'test-image',
        fileSizeOriginal: 1000,
        fileSizeScr: 500,
        fileSizePre: 300,
        fileSizeThm: 100,
        consent: undefined,
      });
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const params: FinalizeImageUploadParams = {
        recResourceId: 'rec-123',
        image_id: 'img-123',
        file_name: 'test-image',
        file_size_original: 1000,
        file_size_scr: 500,
        file_size_pre: 300,
        file_size_thm: 100,
      };

      const error = new Error('Finalize failed');
      mockApi.finalizeImageUpload.mockRejectedValue(error);

      const { result } = renderHook(() => useFinalizeImageUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Finalize failed',
      );
    });
  });

  describe('usePresignDocUpload', () => {
    it('returns a mutation object with expected properties', () => {
      const { result } = renderHook(() => usePresignDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.presignDocUpload with correct parameters', async () => {
      const params: PresignDocUploadParams = {
        recResourceId: 'rec-123',
        fileName: 'test-document.pdf',
      };

      const mockResponse = {
        document_id: 'doc-123',
        url: 'https://s3.example.com/document',
        key: 'key-document',
      };

      mockApi.presignDocUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePresignDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.presignDocUpload).toHaveBeenCalledWith(params);
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const params: PresignDocUploadParams = {
        recResourceId: 'rec-123',
        fileName: 'test-document.pdf',
      };

      const error = new Error('Presign failed');
      mockApi.presignDocUpload.mockRejectedValue(error);

      const { result } = renderHook(() => usePresignDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Presign failed',
      );
    });
  });

  describe('useFinalizeDocUpload', () => {
    it('returns a mutation object with expected properties', () => {
      const { result } = renderHook(() => useFinalizeDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.finalizeDocUpload with correct parameters', async () => {
      const params: FinalizeDocUploadParams = {
        recResourceId: 'rec-123',
        document_id: 'doc-123',
        file_name: 'test-document',
        extension: 'pdf',
        file_size: 5000,
      };

      const mockResponse = { id: 'doc-123', ...params };
      mockApi.finalizeDocUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFinalizeDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.finalizeDocUpload).toHaveBeenCalledWith({
        recResourceId: 'rec-123',
        finalizeDocUploadRequestDto: {
          document_id: 'doc-123',
          file_name: 'test-document',
          extension: 'pdf',
          file_size: 5000,
        },
      });
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const params: FinalizeDocUploadParams = {
        recResourceId: 'rec-123',
        document_id: 'doc-123',
        file_name: 'test-document',
        extension: 'pdf',
        file_size: 5000,
      };

      const error = new Error('Finalize failed');
      mockApi.finalizeDocUpload.mockRejectedValue(error);

      const { result } = renderHook(() => useFinalizeDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(result.current.mutateAsync(params)).rejects.toThrow(
        'Finalize failed',
      );
    });
  });

  describe('retry logic', () => {
    it('configures retry handler for all hooks', () => {
      renderHook(() => usePresignImageUpload(), {
        wrapper: TestQueryClientProvider,
      });
      renderHook(() => useFinalizeImageUpload(), {
        wrapper: TestQueryClientProvider,
      });
      renderHook(() => usePresignDocUpload(), {
        wrapper: TestQueryClientProvider,
      });
      renderHook(() => useFinalizeDocUpload(), {
        wrapper: TestQueryClientProvider,
      });

      expect(createRetryHandler).toHaveBeenCalledTimes(4);
    });
  });
});

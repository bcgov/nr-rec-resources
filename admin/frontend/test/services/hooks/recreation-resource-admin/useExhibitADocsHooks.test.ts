import {
  usePresignExhibitAUpload,
  useFinalizeExhibitAUpload,
  useDeleteExhibitADoc,
} from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';
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

describe('useExhibitADocsHooks', () => {
  const mockApi = {
    presignExhibitAUpload: vi.fn(),
    finalizeExhibitAUpload: vi.fn(),
    deleteExhibitADoc: vi.fn(),
  };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  describe('usePresignExhibitAUpload', () => {
    it('returns a mutation with expected properties', () => {
      const { result } = renderHook(() => usePresignExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });
      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.presignExhibitAUpload with correct params', async () => {
      const mockResponse = {
        url: 'https://s3.example.com/upload',
        document_id: 'doc-1',
      };
      mockApi.presignExhibitAUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePresignExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });

      const params = { recResourceId: 'REC123', fileName: 'exhibit-a.pdf' };
      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.presignExhibitAUpload).toHaveBeenCalledWith(params);
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('propagates errors', async () => {
      const error = new Error('presign failed');
      mockApi.presignExhibitAUpload.mockRejectedValue(error);

      const { result } = renderHook(() => usePresignExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.mutateAsync({
          recResourceId: 'REC123',
          fileName: 'a.pdf',
        }),
      ).rejects.toThrow('presign failed');
    });
  });

  describe('useFinalizeExhibitAUpload', () => {
    it('returns a mutation with expected properties', () => {
      const { result } = renderHook(() => useFinalizeExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });
      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.finalizeExhibitAUpload with correct params', async () => {
      const mockResponse = { document_id: 'doc-1', file_name: 'exhibit-a' };
      mockApi.finalizeExhibitAUpload.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFinalizeExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });

      const params = {
        recResourceId: 'REC123',
        document_id: 'doc-1',
        file_name: 'exhibit-a',
        extension: 'pdf',
        file_size: 12345,
      };

      await waitFor(async () => {
        const response = await result.current.mutateAsync(params);
        expect(response).toEqual(mockResponse);
      });

      expect(mockApi.finalizeExhibitAUpload).toHaveBeenCalledWith(params);
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('propagates errors', async () => {
      const error = new Error('finalize failed');
      mockApi.finalizeExhibitAUpload.mockRejectedValue(error);

      const { result } = renderHook(() => useFinalizeExhibitAUpload(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.mutateAsync({
          recResourceId: 'REC123',
          document_id: 'doc-1',
          file_name: 'exhibit-a',
          extension: 'pdf',
          file_size: 100,
        }),
      ).rejects.toThrow('finalize failed');
    });
  });

  describe('useDeleteExhibitADoc', () => {
    it('returns a mutation with expected properties', () => {
      const { result } = renderHook(() => useDeleteExhibitADoc(), {
        wrapper: TestQueryClientProvider,
      });
      expect(result.current).toMatchObject({
        mutate: expect.any(Function),
        mutateAsync: expect.any(Function),
        isPending: expect.any(Boolean),
      });
    });

    it('calls api.deleteExhibitADoc with correct params', async () => {
      mockApi.deleteExhibitADoc.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteExhibitADoc(), {
        wrapper: TestQueryClientProvider,
      });

      const params = { recResourceId: 'REC123', documentId: 'doc-1' };
      await waitFor(async () => {
        await result.current.mutateAsync(params);
      });

      expect(mockApi.deleteExhibitADoc).toHaveBeenCalledWith(params);
      expect(createRetryHandler).toHaveBeenCalled();
    });

    it('propagates errors', async () => {
      const error = new Error('delete failed');
      mockApi.deleteExhibitADoc.mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteExhibitADoc(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.mutateAsync({
          recResourceId: 'REC123',
          documentId: 'doc-1',
        }),
      ).rejects.toThrow('delete failed');
    });
  });
});

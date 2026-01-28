import { useDocumentUpload } from '@/pages/rec-resource-page/hooks/useDocumentUpload';
import * as store from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFile,
  createMockGalleryFile,
} from './test-utils/upload-delete-test-utils';

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  addPendingDoc: vi.fn(),
  removePendingDoc: vi.fn(),
  updatePendingDoc: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/validateUpload', () => ({
  validateUploadFile: vi.fn(),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/usePresignAndFinalizeHooks',
  () => ({
    usePresignDocUpload: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useFinalizeDocUpload: vi.fn(() => ({ mutateAsync: vi.fn() })),
  }),
);

vi.mock('@/pages/rec-resource-page/hooks/utils/usePresignedUpload', () => ({
  usePresignedUpload: vi.fn(),
}));

import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import { usePresignedUpload } from '@/pages/rec-resource-page/hooks/utils/usePresignedUpload';

const mockExecutePresignedUpload = vi.fn();
const mockRecResource = {
  recResource: { rec_resource_id: 'test-resource-123' },
  rec_resource_id: 'test-resource-123',
  isLoading: false,
  error: null,
};

describe('useDocumentUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRecResource).mockReturnValue(mockRecResource as any);
    vi.mocked(validateUploadFile).mockReturnValue(true);
    vi.mocked(usePresignedUpload).mockReturnValue({
      executePresignedUpload: mockExecutePresignedUpload,
    } as any);
  });

  it('returns upload handlers', () => {
    const { result } = renderHook(() => useDocumentUpload());

    expect(result.current).toMatchObject({
      handleUpload: expect.any(Function),
      handleUploadRetry: expect.any(Function),
    });
  });

  describe('handleUpload', () => {
    it('adds pending doc and calls executePresignedUpload with correct parameters', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      const galleryFile = createMockGalleryFile('document', {
        id: 'temp-doc-123',
        name: 'Test Document',
        extension: 'pdf',
        pendingFile: file,
      });
      const onSuccess = vi.fn();

      mockExecutePresignedUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFile, onSuccess);
      });

      expect(store.addPendingDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Document',
          extension: 'pdf',
          isUploading: true,
          pendingFile: file,
          type: 'document',
        }),
      );

      expect(mockExecutePresignedUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          recResourceId: 'test-resource-123',
          galleryFile: expect.objectContaining({
            name: 'Test Document',
            type: 'document',
          }),
          tempId: 'temp-doc-123',
          presignMutation: expect.any(Object),
          finalizeMutation: expect.any(Object),
          updatePendingFile: store.updatePendingDoc,
          removePendingFile: store.removePendingDoc,
          successMessage: expect.any(Function),
          fileType: 'document',
          onSuccess,
        }),
      );

      const call = mockExecutePresignedUpload.mock.calls[0][0];
      expect(call.successMessage('Test Document')).toBe(
        'File "Test Document" uploaded successfully.',
      );
    });

    it('does nothing if validation fails', async () => {
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);
      const galleryFile = createMockGalleryFile('document', {
        name: 'Test Document',
        pendingFile: createMockFile('test.pdf'),
      });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFile);
      });

      expect(store.addPendingDoc).not.toHaveBeenCalled();
      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
    });

    it('does nothing when recResource is undefined', async () => {
      vi.mocked(useRecResource).mockReturnValue({
        recResource: null,
        rec_resource_id: undefined,
        isLoading: false,
        error: null,
      } as any);
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);

      const galleryFile = createMockGalleryFile('document', {
        name: 'Test Document',
        pendingFile: createMockFile('test.pdf'),
      });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFile);
      });

      expect(store.addPendingDoc).not.toHaveBeenCalled();
      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
    });
  });

  describe('handleUploadRetry', () => {
    it('updates pending doc and calls executePresignedUpload with correct parameters', async () => {
      const pendingFile = createMockFile('test.pdf');
      const pendingDoc = createMockGalleryFile('document', {
        id: 'pending-123',
        name: 'Test Document',
        extension: 'pdf',
        pendingFile,
      });
      const onSuccess = vi.fn();

      mockExecutePresignedUpload.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc, onSuccess);
      });

      expect(store.updatePendingDoc).toHaveBeenCalledWith('pending-123', {
        isUploading: true,
        uploadFailed: false,
      });

      expect(mockExecutePresignedUpload).toHaveBeenCalledWith({
        recResourceId: 'test-resource-123',
        galleryFile: pendingDoc,
        tempId: 'pending-123',
        presignMutation: expect.any(Object),
        finalizeMutation: expect.any(Object),
        updatePendingFile: store.updatePendingDoc,
        removePendingFile: store.removePendingDoc,
        successMessage: expect.any(Function),
        fileType: 'document',
        onSuccess,
      });
    });

    it('does nothing if validation fails', async () => {
      vi.mocked(validateUploadFile).mockReturnValueOnce(false);
      const pendingDoc = createMockGalleryFile('document', {
        id: 'pending-123',
        name: 'Test Document',
        pendingFile: undefined,
      });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc);
      });

      expect(store.updatePendingDoc).not.toHaveBeenCalled();
      expect(mockExecutePresignedUpload).not.toHaveBeenCalled();
    });
  });
});

import { useFileUpload } from '@/pages/rec-resource-page/hooks/utils/useFileUpload';
import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import { GalleryDocument, GalleryImage } from '@/pages/rec-resource-page/types';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFile,
  createMockGalleryFile,
} from '../test-utils/upload-delete-test-utils';

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/fileErrorMessages', () => ({
  formatUploadError: vi.fn((fileLabel, errorInfo, isProcessingError) =>
    isProcessingError
      ? `Failed to process ${fileLabel}: ${errorInfo.message}`
      : `${errorInfo.statusCode} - Failed to upload ${fileLabel}: ${errorInfo.message}. Please try again.`,
  ),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/validateUpload', () => ({
  validateUploadFile: vi.fn(),
}));

const mockHandleApiError = vi.mocked(handleApiError);
const mockAddErrorNotification = vi.mocked(addErrorNotification);
const mockAddSuccessNotification = vi.mocked(addSuccessNotification);
const mockValidateUploadFile = vi.mocked(validateUploadFile);

describe('useFileUpload', () => {
  const mockUpdatePendingFile = vi.fn();
  const mockRemovePendingFile = vi.fn();
  const mockUploadMutation = {
    mutateAsync: vi.fn(),
  };
  const mockProcessFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateUploadFile.mockReturnValue(true);
    mockHandleApiError.mockResolvedValue({
      statusCode: 500,
      message: 'Upload failed',
      isResponseError: false,
      isAuthError: false,
    });
  });

  describe('executeUpload', () => {
    it('should handle successful document upload without processFile', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      mockUploadMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
          isUploading: true,
          uploadFailed: false,
        });
        expect(mockUploadMutation.mutateAsync).toHaveBeenCalledWith({
          recResourceId: 'test-resource-id',
          file: mockDocument.pendingFile,
          fileName: 'test-document.pdf',
        });
        expect(mockAddSuccessNotification).toHaveBeenCalledWith(
          'Document "test-document.pdf" uploaded successfully.',
        );
        expect(mockRemovePendingFile).toHaveBeenCalledWith('temp-doc-123');
      });
    });

    it('should handle successful image upload with processFile', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image.jpg',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const processedData = {
        variants: [{ sizeCode: 'original' }],
      };

      mockProcessFile.mockResolvedValue(processedData);
      mockUploadMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload<GalleryImage>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        uploadMutation: mockUploadMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          isUploading: true,
          uploadFailed: false,
          processingProgress: 0,
          processingStage: 'Validating image...',
        });
        expect(mockProcessFile).toHaveBeenCalledWith(
          mockImage.pendingFile,
          expect.any(Function),
        );
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          processingStage: 'Uploading to server...',
          processingProgress: 100,
        });
        expect(mockUploadMutation.mutateAsync).toHaveBeenCalledWith({
          recResourceId: 'test-resource-id',
          ...processedData,
          fileName: 'test-image.jpg',
        });
        expect(mockAddSuccessNotification).toHaveBeenCalledWith(
          'Image "test-image.jpg" uploaded successfully.',
        );
        expect(mockRemovePendingFile).toHaveBeenCalledWith('temp-img-123');
      });
    });

    it('should call onSuccess callback on successful upload', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const onSuccessMock = vi.fn();
      mockUploadMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess: onSuccessMock,
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
      });
    });

    it('should update progress for image processing', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image.jpg',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const processedData = { variants: [] };
      mockProcessFile.mockImplementation((file, onProgress) => {
        onProgress?.(50, 'Processing...');
        return Promise.resolve(processedData);
      });
      mockUploadMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload<GalleryImage>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        uploadMutation: mockUploadMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          processingProgress: 50,
          processingStage: 'Processing...',
        });
      });
    });

    it('should handle upload error', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const uploadError = new Error('Upload failed');
      mockUploadMutation.mutateAsync.mockRejectedValue(uploadError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'Upload failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
          isUploading: true,
          uploadFailed: false,
        });
        expect(mockAddErrorNotification).toHaveBeenCalledWith(
          expect.stringContaining('Failed to upload test-document.pdf'),
        );
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
          isUploading: false,
          uploadFailed: true,
        });
        expect(mockRemovePendingFile).not.toHaveBeenCalled();
      });
    });

    it('should handle processing error for images', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image.jpg',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const processingError = new Error('Processing failed');
      mockProcessFile.mockRejectedValue(processingError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 0,
        message: 'Processing failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => useFileUpload<GalleryImage>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        uploadMutation: mockUploadMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalledWith(
          expect.stringContaining('Failed to process test-image.jpg'),
        );
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          isUploading: false,
          uploadFailed: true,
          processingStage: undefined,
          processingProgress: undefined,
        });
      });
    });

    it('should not proceed if validation fails', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      mockValidateUploadFile.mockReturnValue(false);

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      expect(mockUploadMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockUpdatePendingFile).not.toHaveBeenCalled();
      expect(mockRemovePendingFile).not.toHaveBeenCalled();
    });

    it('should not update progress for document uploads', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      mockUploadMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
          isUploading: true,
          uploadFailed: false,
        });
        // Should not include processingProgress or processingStage for documents
        expect(mockUpdatePendingFile).not.toHaveBeenCalledWith(
          'temp-doc-123',
          expect.objectContaining({
            processingProgress: expect.anything(),
            processingStage: expect.anything(),
          }),
        );
      });
    });

    it('should handle error without onSuccess callback', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document.pdf',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const uploadError = new Error('Upload failed');
      mockUploadMutation.mutateAsync.mockRejectedValue(uploadError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'Upload failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => useFileUpload<GalleryDocument>());

      await result.current.executeUpload({
        recResourceId: 'test-resource-id',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        uploadMutation: mockUploadMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalled();
        expect(mockRemovePendingFile).not.toHaveBeenCalled();
      });
    });
  });
});

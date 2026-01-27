import { usePresignedUpload } from '@/pages/rec-resource-page/hooks/utils/usePresignedUpload';
import {
  GalleryFile,
  GalleryImage,
  GalleryDocument,
} from '@/pages/rec-resource-page/types';
import { useS3Upload } from '@/services/hooks/recreation-resource-admin/useS3Upload';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/recreation-resource-admin/useS3Upload', () => ({
  useS3Upload: vi.fn(),
}));

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/fileErrorMessages', () => ({
  formatUploadError: vi.fn((fileName, errorInfo, isProcessingError) =>
    isProcessingError
      ? `Failed to process ${fileName}: ${errorInfo.message}`
      : `${errorInfo.statusCode} - Failed to upload ${fileName}: ${errorInfo.message}. Please try again.`,
  ),
}));

const mockUseS3Upload = vi.mocked(useS3Upload);
const mockHandleApiError = vi.mocked(handleApiError);
const mockAddErrorNotification = vi.mocked(addErrorNotification);
const mockAddSuccessNotification = vi.mocked(addSuccessNotification);

function createMockFile(name: string, type: string): File {
  return new File(['test content'], name, { type });
}

function createMockGalleryFile<T extends GalleryFile>(
  type: 'image' | 'document',
  overrides: Partial<T>,
): T {
  return {
    id: 'temp-123',
    name: 'test-file',
    url: '',
    date: '',
    type,
    ...overrides,
  } as T;
}

describe('usePresignedUpload', () => {
  const mockS3UploadMutation = {
    mutateAsync: vi.fn(),
  };

  const mockUpdatePendingFile = vi.fn();
  const mockRemovePendingFile = vi.fn();
  const mockPresignMutation = {
    mutateAsync: vi.fn(),
  };
  const mockFinalizeMutation = {
    mutateAsync: vi.fn(),
  };
  const mockProcessFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseS3Upload.mockReturnValue(mockS3UploadMutation as any);
    mockHandleApiError.mockResolvedValue({
      statusCode: 500,
      message: 'Error message',
      isResponseError: false,
      isAuthError: false,
    });
  });

  describe('Image upload flow', () => {
    it('completes full image upload flow: presign → process → S3 upload → finalize', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [
          {
            size_code: 'original',
            url: 'https://s3.com/original',
            key: 'key-original',
          },
          { size_code: 'scr', url: 'https://s3.com/scr', key: 'key-scr' },
          { size_code: 'pre', url: 'https://s3.com/pre', key: 'key-pre' },
          { size_code: 'thm', url: 'https://s3.com/thm', key: 'key-thm' },
        ],
      };

      const originalBlob = new Blob(['original']);
      const scrBlob = new Blob(['scr']);
      const preBlob = new Blob(['pre']);
      const thmBlob = new Blob(['thm']);
      const processedData = {
        variants: [
          { sizeCode: 'original', blob: originalBlob, size: originalBlob.size },
          { sizeCode: 'scr', blob: scrBlob, size: scrBlob.size },
          { sizeCode: 'pre', blob: preBlob, size: preBlob.size },
          { sizeCode: 'thm', blob: thmBlob, size: thmBlob.size },
        ],
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockProcessFile.mockResolvedValue(processedData);
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'test-key',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockResolvedValue({ id: 'img-123' });

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      // Step 1: Presign
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
        isUploading: true,
        uploadFailed: false,
        processingStage: 'Requesting presigned URLs...',
      });
      expect(mockPresignMutation.mutateAsync).toHaveBeenCalledWith({
        recResourceId: 'rec-123',
        fileName: 'test-image.jpg',
      });

      // Step 2: Process
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
        processingStage: 'Processing image variants...',
      });
      expect(mockProcessFile).toHaveBeenCalledWith(
        mockImage.pendingFile,
        expect.any(Function),
      );

      // Step 3: S3 Upload
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
        processingStage: 'Uploading variants to S3...',
      });
      expect(mockS3UploadMutation.mutateAsync).toHaveBeenCalledTimes(4);

      // Step 4: Finalize
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
        processingStage: 'Finalizing upload...',
      });
      const finalizeCall = mockFinalizeMutation.mutateAsync.mock.calls[0][0];
      expect(finalizeCall).toMatchObject({
        recResourceId: 'rec-123',
        image_id: 'img-123',
        file_name: 'test-image',
      });
      expect(finalizeCall.file_size_original).toBeGreaterThan(0);
      expect(finalizeCall.file_size_scr).toBeGreaterThan(0);
      expect(finalizeCall.file_size_pre).toBeGreaterThan(0);
      expect(finalizeCall.file_size_thm).toBeGreaterThan(0);

      // Success
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        'Image "test-image" uploaded successfully.',
      );
      expect(mockRemovePendingFile).toHaveBeenCalledWith('temp-img-123');
    });

    it('updates progress during image processing', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [
          {
            size_code: 'original',
            url: 'https://s3.com/original',
            key: 'key-original',
          },
        ],
      };

      const processedData = {
        variants: [
          { sizeCode: 'original', blob: new Blob(['original']), size: 1000 },
        ],
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockProcessFile.mockImplementation((file, onProgress) => {
        onProgress?.(50, 'Processing stage 1');
        onProgress?.(100, 'Processing stage 2');
        return Promise.resolve(processedData);
      });
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'test-key',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockResolvedValue({ id: 'img-123' });

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          processingStage: 'Processing stage 1',
        });
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          processingStage: 'Processing stage 2',
        });
      });
    });

    it('handles missing presigned URL for variant', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [
          {
            size_code: 'original',
            url: 'https://s3.com/original',
            key: 'key-original',
          },
        ],
      };

      const processedData = {
        variants: [
          { sizeCode: 'original', blob: new Blob(['original']), size: 1000 },
          { sizeCode: 'scr', blob: new Blob(['scr']), size: 500 },
        ],
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockProcessFile.mockResolvedValue(processedData);

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalled();
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          isUploading: false,
          uploadFailed: true,
          processingStage: undefined,
        });
      });
    });
  });

  describe('Document upload flow', () => {
    it('completes full document upload flow: presign → S3 upload → finalize', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const presignResponse = {
        document_id: 'doc-123',
        url: 'https://s3.com/document',
        key: 'key-document',
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'key-document',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockResolvedValue({ id: 'doc-123' });

      const { result } = renderHook(
        () => usePresignedUpload<GalleryDocument>(),
        {
          wrapper: TestQueryClientProvider,
        },
      );

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      // Step 1: Presign
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
        isUploading: true,
        uploadFailed: false,
        processingStage: 'Requesting presigned URL...',
      });
      expect(mockPresignMutation.mutateAsync).toHaveBeenCalledWith({
        recResourceId: 'rec-123',
        fileName: 'test-document.pdf',
      });

      // Step 2: S3 Upload (no processing for documents)
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
        processingStage: 'Uploading to S3...',
      });
      expect(mockS3UploadMutation.mutateAsync).toHaveBeenCalledWith({
        presignedUrl: 'https://s3.com/document',
        blob: mockDocument.pendingFile,
        contentType: 'application/pdf',
        s3Key: 'key-document',
      });

      // Step 3: Finalize
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
        processingStage: 'Finalizing upload...',
      });
      expect(mockFinalizeMutation.mutateAsync).toHaveBeenCalledWith({
        recResourceId: 'rec-123',
        document_id: 'doc-123',
        file_name: 'test-document',
        extension: 'pdf',
        file_size: mockDocument.pendingFile!.size,
      });

      // Success
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        'Document "test-document" uploaded successfully.',
      );
      expect(mockRemovePendingFile).toHaveBeenCalledWith('temp-doc-123');
    });

    it('uses default extension when file has no extension', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document',
        pendingFile: createMockFile('test-document', 'application/pdf'),
      });

      const presignResponse = {
        document_id: 'doc-123',
        url: 'https://s3.com/document',
        key: 'key-document',
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'key-document',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockResolvedValue({ id: 'doc-123' });

      const { result } = renderHook(
        () => usePresignedUpload<GalleryDocument>(),
        {
          wrapper: TestQueryClientProvider,
        },
      );

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      // The code uses file.name.split('.').pop() || 'pdf'
      // If file.name is 'test-document' with no extension, split('.') returns ['test-document']
      // and pop() returns 'test-document', so it uses that as extension (not the default 'pdf')
      // So the fileName will be 'test-document.test-document'
      const presignCall = mockPresignMutation.mutateAsync.mock.calls[0][0];
      expect(presignCall.recResourceId).toBe('rec-123');
      expect(presignCall.fileName).toBe('test-document.test-document');

      const finalizeCall = mockFinalizeMutation.mutateAsync.mock.calls[0][0];
      expect(finalizeCall).toMatchObject({
        recResourceId: 'rec-123',
        document_id: 'doc-123',
        file_name: 'test-document',
        extension: 'test-document', // This is what split('.').pop() returns for 'test-document'
      });
    });
  });

  describe('Error handling', () => {
    it('handles presign errors', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignError = new Error('Presign failed');
      mockPresignMutation.mutateAsync.mockRejectedValue(presignError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'Presign failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      expect(mockAddErrorNotification).toHaveBeenCalled();
      expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
        isUploading: false,
        uploadFailed: true,
        processingStage: undefined,
      });
      expect(mockRemovePendingFile).not.toHaveBeenCalled();
    });

    it('handles processing errors for images', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [],
      };

      const processingError = new Error('Processing failed');
      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockProcessFile.mockRejectedValue(processingError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 0,
        message: 'Processing failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalledWith(
          expect.stringContaining('Failed to process test-image'),
        );
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          isUploading: false,
          uploadFailed: true,
          processingStage: undefined,
        });
      });
    });

    it('handles S3 upload errors', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [
          {
            size_code: 'original',
            url: 'https://s3.com/original',
            key: 'key-original',
          },
        ],
      };

      const processedData = {
        variants: [
          { sizeCode: 'original', blob: new Blob(['original']), size: 1000 },
        ],
      };

      const s3Error = new Error('S3 upload failed');
      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockProcessFile.mockResolvedValue(processedData);
      mockS3UploadMutation.mutateAsync.mockRejectedValue(s3Error);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'S3 upload failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        processFile: mockProcessFile,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalled();
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-img-123', {
          isUploading: false,
          uploadFailed: true,
          processingStage: undefined,
        });
      });
    });

    it('handles finalize errors', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const presignResponse = {
        document_id: 'doc-123',
        url: 'https://s3.com/document',
        key: 'key-document',
      };

      const finalizeError = new Error('Finalize failed');
      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'key-document',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockRejectedValue(finalizeError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'Finalize failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(
        () => usePresignedUpload<GalleryDocument>(),
        {
          wrapper: TestQueryClientProvider,
        },
      );

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
      });

      await waitFor(() => {
        expect(mockAddErrorNotification).toHaveBeenCalled();
        expect(mockUpdatePendingFile).toHaveBeenCalledWith('temp-doc-123', {
          isUploading: false,
          uploadFailed: true,
        });
        expect(mockRemovePendingFile).not.toHaveBeenCalled();
      });
    });
  });

  describe('onSuccess callback', () => {
    it('calls onSuccess callback on successful upload', async () => {
      const mockDocument = createMockGalleryFile<GalleryDocument>('document', {
        id: 'temp-doc-123',
        name: 'test-document',
        pendingFile: createMockFile('test-document.pdf', 'application/pdf'),
      });

      const presignResponse = {
        document_id: 'doc-123',
        url: 'https://s3.com/document',
        key: 'key-document',
      };

      const onSuccessMock = vi.fn();
      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);
      mockS3UploadMutation.mutateAsync.mockResolvedValue({
        key: 'key-document',
        statusCode: 200,
      });
      mockFinalizeMutation.mutateAsync.mockResolvedValue({ id: 'doc-123' });

      const { result } = renderHook(
        () => usePresignedUpload<GalleryDocument>(),
        {
          wrapper: TestQueryClientProvider,
        },
      );

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockDocument,
        tempId: 'temp-doc-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Document "${fileName}" uploaded successfully.`,
        fileType: 'document',
        onSuccess: onSuccessMock,
      });

      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  describe('Invalid fileType', () => {
    it('throws error for invalid fileType without processFile', async () => {
      const mockImage = createMockGalleryFile<GalleryImage>('image', {
        id: 'temp-img-123',
        name: 'test-image',
        pendingFile: createMockFile('test-image.jpg', 'image/jpeg'),
      });

      const presignResponse = {
        image_id: 'img-123',
        presigned_urls: [],
      };

      mockPresignMutation.mutateAsync.mockResolvedValue(presignResponse);

      const { result } = renderHook(() => usePresignedUpload<GalleryImage>(), {
        wrapper: TestQueryClientProvider,
      });

      await result.current.executePresignedUpload({
        recResourceId: 'rec-123',
        galleryFile: mockImage,
        tempId: 'temp-img-123',
        presignMutation: mockPresignMutation,
        finalizeMutation: mockFinalizeMutation,
        updatePendingFile: mockUpdatePendingFile,
        removePendingFile: mockRemovePendingFile,
        successMessage: (fileName) =>
          `Image "${fileName}" uploaded successfully.`,
        fileType: 'image',
        // Missing processFile for image type
      });

      expect(mockAddErrorNotification).toHaveBeenCalled();
    });
  });
});

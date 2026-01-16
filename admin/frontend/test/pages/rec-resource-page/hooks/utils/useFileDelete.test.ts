import { useFileDelete } from '@/pages/rec-resource-page/hooks/utils/useFileDelete';
import { GalleryDocument, GalleryImage } from '@/pages/rec-resource-page/types';
import { handleApiError } from '@/services/utils/errorHandler';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/hooks/utils/fileErrorMessages', () => ({
  formatDeleteError: vi.fn(
    (fileName, errorInfo) =>
      `${errorInfo.statusCode} - Failed to delete ${fileName}: ${errorInfo.message}. Please try again.`,
  ),
}));

const mockHandleApiError = vi.mocked(handleApiError);
const mockAddErrorNotification = vi.mocked(addErrorNotification);
const mockAddSuccessNotification = vi.mocked(addSuccessNotification);

describe('useFileDelete', () => {
  const mockUpdateGalleryFile = vi.fn();
  const mockSetFileToDelete = vi.fn();
  const mockDeleteMutation = {
    mutateAsync: vi.fn(),
  };
  const mockGetMutationParams = vi.fn((recResourceId, fileId) => ({
    recResourceId,
    fileId,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleApiError.mockResolvedValue({
      statusCode: 500,
      message: 'Delete failed',
      isResponseError: false,
      isAuthError: false,
    });
  });

  describe('executeDelete', () => {
    it('should handle successful deletion', async () => {
      const mockImage: GalleryImage = {
        id: 'test-image-id',
        name: 'test-image.jpg',
        date: '2024-01-01',
        url: 'https://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
        variants: [],
        previewUrl: 'https://example.com/preview.jpg',
      };

      mockDeleteMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileDelete<GalleryImage>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: mockImage,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      await waitFor(() => {
        expect(mockUpdateGalleryFile).toHaveBeenCalledWith(mockImage.id, {
          isDeleting: true,
        });
        expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith({
          recResourceId: 'test-resource-id',
          fileId: mockImage.id,
        });
        expect(mockAddSuccessNotification).toHaveBeenCalledWith(
          `Image "test-image.jpg" deleted successfully.`,
        );
        expect(mockSetFileToDelete).toHaveBeenCalledWith(undefined);
      });
    });

    it('should call onSuccess callback on successful deletion', async () => {
      const mockDocument: GalleryDocument = {
        id: 'test-doc-id',
        name: 'test-doc.pdf',
        date: '2024-01-01',
        url: 'https://example.com/test.pdf',
        extension: 'pdf',
        type: 'document',
      };

      const onSuccessMock = vi.fn();
      mockDeleteMutation.mutateAsync.mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileDelete<GalleryDocument>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: mockDocument,
        expectedType: 'document',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Document "${fileName}" deleted successfully.`,
        errorMessage:
          'Unable to delete document: missing required information.',
        onSuccess: onSuccessMock,
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled();
      });
    });

    it('should handle deletion error', async () => {
      const mockImage: GalleryImage = {
        id: 'test-image-id',
        name: 'test-image.jpg',
        date: '2024-01-01',
        url: 'https://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
        variants: [],
        previewUrl: 'https://example.com/preview.jpg',
      };

      const deleteError = new Error('Delete failed');
      mockDeleteMutation.mutateAsync.mockRejectedValue(deleteError);
      mockHandleApiError.mockResolvedValue({
        statusCode: 500,
        message: 'Delete failed',
        isResponseError: false,
        isAuthError: false,
      });

      const { result } = renderHook(() => useFileDelete<GalleryImage>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: mockImage,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      await waitFor(() => {
        expect(mockUpdateGalleryFile).toHaveBeenCalledWith(mockImage.id, {
          isDeleting: true,
        });
        expect(mockAddErrorNotification).toHaveBeenCalledWith(
          expect.stringContaining('Failed to delete test-image.jpg'),
        );
        expect(mockUpdateGalleryFile).toHaveBeenCalledWith(mockImage.id, {
          isDeleting: false,
          deleteFailed: true,
        });
      });
    });

    it('should not proceed if recResourceId is missing', async () => {
      const mockImage: GalleryImage = {
        id: 'test-image-id',
        name: 'test-image.jpg',
        date: '2024-01-01',
        url: 'https://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
        variants: [],
        previewUrl: 'https://example.com/preview.jpg',
      };

      const { result } = renderHook(() => useFileDelete<GalleryImage>());

      await result.current.executeDelete({
        recResourceId: undefined,
        file: mockImage,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Unable to delete image: missing required information.',
      );
      expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('should not proceed if file.id is missing', async () => {
      const mockImage: GalleryImage = {
        id: '',
        name: 'test-image.jpg',
        date: '2024-01-01',
        url: 'https://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
        variants: [],
        previewUrl: 'https://example.com/preview.jpg',
      };

      const { result } = renderHook(() => useFileDelete<GalleryImage>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: mockImage,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Unable to delete image: missing required information.',
      );
      expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('should not proceed if file.type does not match expectedType', async () => {
      const mockDocument: GalleryDocument = {
        id: 'test-doc-id',
        name: 'test-doc.pdf',
        date: '2024-01-01',
        url: 'https://example.com/test.pdf',
        extension: 'pdf',
        type: 'document',
      };

      const { result } = renderHook(() => useFileDelete<GalleryDocument>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: mockDocument,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Unable to delete image: missing required information.',
      );
      expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('should not proceed if file is undefined', async () => {
      const { result } = renderHook(() => useFileDelete<GalleryImage>());

      await result.current.executeDelete({
        recResourceId: 'test-resource-id',
        file: undefined,
        expectedType: 'image',
        deleteMutation: mockDeleteMutation,
        updateGalleryFile: mockUpdateGalleryFile,
        setFileToDelete: mockSetFileToDelete,
        getMutationParams: mockGetMutationParams,
        successMessage: (fileName) =>
          `Image "${fileName}" deleted successfully.`,
        errorMessage: 'Unable to delete image: missing required information.',
      });

      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Unable to delete image: missing required information.',
      );
      expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });
});

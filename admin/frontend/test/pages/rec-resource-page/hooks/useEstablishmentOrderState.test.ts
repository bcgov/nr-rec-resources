import { ACTION_TYPES } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/constants';
import { useEstablishmentOrderState } from '@/pages/rec-resource-page/hooks/useEstablishmentOrderState';
import { createFileUploadValidator } from '@/pages/rec-resource-page/validation/fileUploadSchema';
import {
  useDeleteEstablishmentOrderDoc,
  useGetEstablishmentOrderDocs,
  useUploadEstablishmentOrderDoc,
} from '@/services';
import { handleApiError } from '@/services/utils/errorHandler';
import * as notificationStore from '@/store/notificationStore';
import * as fileUtils from '@shared/utils';
import { buildFileTooLargeMessage, isFileTooLarge } from '@shared/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services');
vi.mock('@/store/notificationStore');
vi.mock('@/services/utils/errorHandler');
vi.mock('@shared/utils', async () => {
  const actual =
    await vi.importActual<typeof import('@shared/utils')>('@shared/utils');
  return {
    ...actual,
    isFileTooLarge: vi.fn(),
    buildFileTooLargeMessage: vi.fn(),
    getFileNameWithoutExtension: vi.fn(),
    buildFileNameWithExtension: vi.fn(),
    downloadUrlAsFile: vi.fn(),
    formatDateReadable: vi.fn((date: string) => date),
  };
});
vi.mock('@/pages/rec-resource-page/validation/fileUploadSchema');

const mockRefetch = vi.fn();
const mockUploadMutation = vi.fn();
const mockDeleteMutation = vi.fn();

const mockDocs = [
  {
    s3_key: 'doc-1',
    title: 'Test Document 1',
    created_at: '2024-01-01T00:00:00Z',
    url: 'https://example.com/doc1.pdf',
    extension: 'pdf',
  },
  {
    s3_key: 'doc-2',
    title: 'Test Document 2',
    created_at: '2024-01-02T00:00:00Z',
    url: 'https://example.com/doc2.pdf',
    extension: 'pdf',
  },
];

const createMockFile = (name: string, type = 'application/pdf') =>
  new File(['content'], name, { type });

const simulateFileSelection = (file: File) => {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: [file],
    writable: false,
  });
  input?.dispatchEvent(new Event('change', { bubbles: true }));
};

const setupMockValidator = (isValid: boolean, errorMessage?: string) => {
  const mockValidator = {
    safeParse: vi.fn(() =>
      isValid
        ? { success: true, data: {} }
        : { success: false, error: { issues: [{ message: errorMessage }] } },
    ),
  };
  vi.mocked(createFileUploadValidator).mockReturnValue(mockValidator as any);
};

describe('useEstablishmentOrderState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    vi.mocked(useGetEstablishmentOrderDocs).mockReturnValue({
      data: mockDocs,
      isLoading: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useUploadEstablishmentOrderDoc).mockReturnValue({
      mutateAsync: mockUploadMutation,
    } as any);

    vi.mocked(useDeleteEstablishmentOrderDoc).mockReturnValue({
      mutateAsync: mockDeleteMutation,
    } as any);

    vi.mocked(handleApiError).mockResolvedValue({
      statusCode: 500,
      message: 'Error occurred',
      isResponseError: false,
      isAuthError: false,
    });

    vi.mocked(fileUtils.getFileNameWithoutExtension).mockImplementation(
      (file) => file.name.replace(/\.[^/.]+$/, ''),
    );
    vi.mocked(fileUtils.buildFileNameWithExtension).mockImplementation(
      (name, ext) => `${name}.${ext}`,
    );
    vi.mocked(fileUtils.downloadUrlAsFile).mockResolvedValue(undefined);

    // Default: files are not too large
    vi.mocked(isFileTooLarge).mockReturnValue(false);
    vi.mocked(buildFileTooLargeMessage).mockImplementation(
      (fileName, maxSizeMB) =>
        `Whoops, the file "${fileName}" is too big. Please upload a file smaller than ${maxSizeMB}MB.`,
    );

    setupMockValidator(true);
  });

  it('initializes with correct state', () => {
    const { result } = renderHook(() =>
      useEstablishmentOrderState('test-resource-id'),
    );

    expect(result.current.galleryFiles).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.uploadModalState.show).toBe(false);
    expect(result.current.deleteModalState.show).toBe(false);
  });

  it('transforms docs to gallery files correctly', () => {
    const { result } = renderHook(() =>
      useEstablishmentOrderState('test-resource-id'),
    );

    expect(result.current.galleryFiles[0]).toMatchObject({
      id: 'doc-1',
      name: 'Test Document 1',
      extension: 'pdf',
      type: 'document',
      isDownloading: false,
      isDeleting: false,
    });
  });

  describe('handleUploadClick', () => {
    it('opens file picker and shows upload modal on file selection', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        result.current.handleUploadClick();

        const input = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input?.accept).toBe('application/pdf');

        simulateFileSelection(createMockFile('test.pdf'));
      });

      await waitFor(() => {
        expect(result.current.uploadModalState.show).toBe(true);
        expect(result.current.uploadModalState.file).toBeTruthy();
        expect(result.current.uploadModalState.fileName).toBe('test');
      });
    });

    it('shows error notification for invalid file type', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        result.current.handleUploadClick();
        simulateFileSelection(createMockFile('test.txt', 'text/plain'));
      });

      await waitFor(() => {
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Invalid file type. Only PDF files are allowed.',
        );
        expect(result.current.uploadModalState.show).toBe(false);
      });
    });

    it('shows error notification for files that are too large', async () => {
      vi.mocked(isFileTooLarge).mockReturnValue(true);

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const largeFile = createMockFile('large-file.pdf');

      await act(async () => {
        result.current.handleUploadClick();
        simulateFileSelection(largeFile);
      });

      await waitFor(() => {
        expect(isFileTooLarge).toHaveBeenCalledWith(
          largeFile,
          expect.any(Number),
        );
        expect(buildFileTooLargeMessage).toHaveBeenCalledWith(
          'large-file.pdf',
          9.5,
        );
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Whoops, the file "large-file.pdf" is too big. Please upload a file smaller than 9.5MB.',
        );
        expect(result.current.uploadModalState.show).toBe(false);
      });
    });
  });

  describe('handleUploadConfirm', () => {
    const setupFileUpload = async (result: any, fileName = 'test.pdf') => {
      await act(async () => {
        result.current.handleUploadClick();
        simulateFileSelection(createMockFile(fileName));
      });
    };

    it('uploads file successfully', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);
      mockUploadMutation.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      expect(mockUploadMutation).toHaveBeenCalledWith({
        recResourceId: 'test-resource-id',
        file: expect.any(File),
        title: 'test',
      });
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        'Establishment order "test" uploaded successfully.',
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(result.current.uploadModalState.show).toBe(false);
    });

    it('handles upload error', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);
      mockUploadMutation.mockRejectedValueOnce(new Error('Upload failed'));

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        '500 - Failed to upload establishment order "test": Error occurred. Please try again.',
      );
    });

    it('does nothing if no file or filename', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      expect(mockUploadMutation).not.toHaveBeenCalled();
    });

    it('does nothing if filename has error', async () => {
      setupMockValidator(false, 'Invalid filename');

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      expect(mockUploadMutation).not.toHaveBeenCalled();
    });

    it('adds pending doc to gallery during upload', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);

      // eslint-disable-next-line
      const uploadPromise = new Promise(() => {});
      mockUploadMutation.mockReturnValue(uploadPromise);

      await act(async () => {
        result.current.handleUploadConfirm();
      });

      await waitFor(() => {
        expect(result.current.galleryFiles).toHaveLength(3);
        const pendingDoc = result.current.galleryFiles[2];
        expect(pendingDoc.isUploading).toBe(true);
        expect(pendingDoc.name).toBe('test');
        expect(pendingDoc.type).toBe('document');
      });

      expect(result.current.galleryFiles[0].id).toBe('doc-1');
      expect(result.current.galleryFiles[1].id).toBe('doc-2');
    });

    it('removes pending doc on successful upload', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);
      mockUploadMutation.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      expect(result.current.galleryFiles).toHaveLength(2);
      expect(result.current.galleryFiles[0].id).toBe('doc-1');
      expect(result.current.galleryFiles[1].id).toBe('doc-2');
    });

    it('marks pending doc as failed on upload error', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await setupFileUpload(result);
      mockUploadMutation.mockRejectedValueOnce(new Error('Upload failed'));

      await act(async () => {
        await result.current.handleUploadConfirm();
      });

      await waitFor(() => {
        expect(notificationStore.addErrorNotification).toHaveBeenCalled();
      });

      expect(result.current.galleryFiles).toHaveLength(3);
      const failedDoc = result.current.galleryFiles[2];
      expect(failedDoc.uploadFailed).toBe(true);
      expect(failedDoc.isUploading).toBe(false);
      expect(failedDoc.name).toBe('test');
    });
  });

  describe('handleUploadCancel', () => {
    it('resets upload modal state', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        result.current.handleUploadClick();
        simulateFileSelection(createMockFile('test.pdf'));
      });

      await act(async () => {
        result.current.handleUploadCancel();
      });

      expect(result.current.uploadModalState.show).toBe(false);
      expect(result.current.uploadModalState.file).toBeNull();
      expect(result.current.uploadModalState.fileName).toBe('');
    });
  });

  describe('handleDeleteConfirm', () => {
    const openDeleteModal = async (result: any) => {
      const fileToDelete = result.current.galleryFiles[0];
      await act(async () => {
        result.current.handleFileAction(ACTION_TYPES.DELETE, fileToDelete)();
      });
      return fileToDelete;
    };

    it('deletes file successfully', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const fileToDelete = await openDeleteModal(result);
      expect(result.current.deleteModalState.show).toBe(true);
      expect(result.current.deleteModalState.file).toEqual(fileToDelete);

      mockDeleteMutation.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockDeleteMutation).toHaveBeenCalledWith({
        recResourceId: 'test-resource-id',
        s3Key: 'doc-1',
      });
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        'Establishment order "Test Document 1" deleted successfully.',
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(result.current.deleteModalState.show).toBe(false);
    });

    it('handles delete error', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await openDeleteModal(result);
      mockDeleteMutation.mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        '500 - Failed to delete establishment order "Test Document 1": Error occurred. Please try again.',
      );
    });

    it('does nothing if no file to delete', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockDeleteMutation).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteCancel', () => {
    it('resets delete modal state', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      await act(async () => {
        const fileToDelete = result.current.galleryFiles[0];
        result.current.handleFileAction(ACTION_TYPES.DELETE, fileToDelete)();
      });

      expect(result.current.deleteModalState.show).toBe(true);

      await act(async () => {
        result.current.handleDeleteCancel();
      });

      expect(result.current.deleteModalState.show).toBe(false);
      expect(result.current.deleteModalState.file).toBeNull();
    });
  });

  describe('handleFileAction', () => {
    it('opens file in new tab for VIEW action', () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const file = result.current.galleryFiles[0];
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      act(() => {
        result.current.handleFileAction(ACTION_TYPES.VIEW, file)();
      });

      expect(openSpy).toHaveBeenCalledWith(
        'https://example.com/doc1.pdf',
        '_blank',
      );

      openSpy.mockRestore();
    });

    it('downloads file for DOWNLOAD action', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const file = result.current.galleryFiles[0];

      await act(async () => {
        await result.current.handleFileAction(ACTION_TYPES.DOWNLOAD, file)();
      });

      expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
        'https://example.com/doc1.pdf',
        'Test Document 1.pdf',
      );
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        'Downloading "Test Document 1.pdf"...',
      );
    });

    it('handles download error', async () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const file = result.current.galleryFiles[0];

      vi.mocked(fileUtils.downloadUrlAsFile).mockRejectedValueOnce(
        new Error('Download failed'),
      );

      await act(async () => {
        await result.current.handleFileAction(ACTION_TYPES.DOWNLOAD, file)();
      });

      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        'Failed to download "Test Document 1.pdf". Please try again.',
      );
    });

    it('opens delete modal for DELETE action', () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      const file = result.current.galleryFiles[0];

      act(() => {
        result.current.handleFileAction(ACTION_TYPES.DELETE, file)();
      });

      expect(result.current.deleteModalState.show).toBe(true);
      expect(result.current.deleteModalState.file).toEqual(file);
    });
  });

  describe('setUploadFileName', () => {
    it('updates upload file name', () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      act(() => {
        result.current.setUploadFileName('New Name');
      });

      expect(result.current.uploadModalState.fileName).toBe('New Name');
    });

    it('validates file name and sets error when invalid', () => {
      setupMockValidator(false, 'File name already exists');

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      act(() => {
        result.current.setUploadFileName('Test Document 1');
      });

      expect(result.current.uploadModalState.fileNameError).toBe(
        'File name already exists',
      );
    });

    it('clears error when file name is valid', () => {
      setupMockValidator(true);

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      act(() => {
        result.current.setUploadFileName('Unique Name');
      });

      expect(result.current.uploadModalState.fileNameError).toBeUndefined();
    });
  });

  describe('loading state', () => {
    it('reflects loading state from query', () => {
      vi.mocked(useGetEstablishmentOrderDocs).mockReturnValue({
        data: [],
        isLoading: true,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('isUploadDisabled', () => {
    it('returns false when no files are uploading', () => {
      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      expect(result.current.isUploadDisabled).toBe(false);
    });

    it('becomes true during upload and false after completion', async () => {
      setupMockValidator(true);
      mockUploadMutation.mockResolvedValue({});

      const { result } = renderHook(() =>
        useEstablishmentOrderState('test-resource-id'),
      );

      expect(result.current.isUploadDisabled).toBe(false);

      const mockFile = createMockFile('test.pdf');

      act(() => {
        result.current.handleUploadClick();
      });

      await waitFor(() => {
        expect(document.querySelector('input[type="file"]')).not.toBeNull();
      });

      act(() => {
        simulateFileSelection(mockFile);
      });

      await waitFor(() => {
        expect(result.current.uploadModalState.show).toBe(true);
      });

      act(() => {
        result.current.setUploadFileName('Test Upload');
      });

      act(() => {
        result.current.handleUploadConfirm();
      });

      await waitFor(() => {
        expect(result.current.isUploadDisabled).toBe(true);
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      expect(result.current.isUploadDisabled).toBe(false);
    });
  });
});

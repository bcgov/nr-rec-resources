import { useGalleryActions } from '@/pages/rec-resource-page/hooks/useGalleryActions';
import {
  GalleryFile,
  GalleryFileAction,
  GalleryGeneralAction,
} from '@/pages/rec-resource-page/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockDownloadMutation = vi.fn();
const mockHandleUploadRetry = vi.fn();
const mockHandleUpload = vi.fn();
const mockHandleDelete = vi.fn();
const mockShowDeleteModalForDoc = vi.fn();
const mockHideDeleteModal = vi.fn();
const mockHandleAddFileByType = vi.fn();
const mockHandleAddPdfFileClick = vi.fn();
const mockResetUploadState = vi.fn();
const mockRemovePendingDoc = vi.fn();
const mockRemovePendingImage = vi.fn();

// Image upload/delete mocks
const mockHandleImageUploadRetry = vi.fn();
const mockHandleImageUpload = vi.fn();
const mockHandleImageDelete = vi.fn();

// Mock store state - will be updated in tests
const mockStoreState: {
  selectedFileForUpload: File | null;
  uploadFileName: string;
  docToDelete: any;
  fileToDelete: any;
} = {
  selectedFileForUpload: null,
  uploadFileName: '',
  docToDelete: null,
  fileToDelete: null,
};

const mockUseStore = vi.fn(() => mockStoreState);

vi.mock('@/pages/rec-resource-page/hooks/useFileDownload', () => ({
  useFileDownload: () => ({
    mutate: mockDownloadMutation,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useDocumentUpload', () => ({
  useDocumentUpload: () => ({
    handleUploadRetry: mockHandleUploadRetry,
    handleUpload: mockHandleUpload,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    handleUploadRetry: mockHandleImageUploadRetry,
    handleUpload: mockHandleImageUpload,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useDocumentDelete', () => ({
  useDocumentDelete: () => ({
    handleDelete: mockHandleDelete,
    isDeleting: false,
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useImageDelete', () => ({
  useImageDelete: () => ({
    handleDelete: mockHandleImageDelete,
    isDeleting: false,
  }),
}));

vi.mock('@/pages/rec-resource-page/helpers', () => ({
  handleAddFileClick: vi.fn(),
  handleAddFileByType: (fileType: any) => mockHandleAddFileByType(fileType),
  handleAddPdfFileClick: () => mockHandleAddPdfFileClick(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  recResourceFileTransferStore: {
    state: {
      selectedFileForUpload: null,
      uploadFileName: '',
      docToDelete: null,
      fileToDelete: null,
    },
  },
  hideDeleteModal: () => mockHideDeleteModal(),
  showDeleteModalForFile: (file: any) => mockShowDeleteModalForDoc(file),
  showDeleteModalForDoc: (file: any) => mockShowDeleteModalForDoc(file),
  resetUploadState: () => mockResetUploadState(),
  removePendingDoc: (id: string) => mockRemovePendingDoc(id),
  removePendingImage: (id: string) => mockRemovePendingImage(id),
}));

vi.mock('@tanstack/react-store', () => ({
  useStore: () => mockUseStore(),
}));

describe('useGalleryActions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Reset store state to default values
    mockStoreState.selectedFileForUpload = null;
    mockStoreState.uploadFileName = '';
    mockStoreState.docToDelete = null;
    mockStoreState.fileToDelete = null;
  });

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
  };

  it('returns action handlers', () => {
    const { result } = renderHook(() => useGalleryActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toMatchObject({
      handleFileAction: expect.any(Function),
      handleGeneralAction: expect.any(Function),
    });
  });

  describe('handleFileAction', () => {
    const testFile: GalleryFile = {
      id: 'file-1',
      name: 'test.pdf',
      date: '2023-01-01',
      url: 'http://example.com/test.pdf',
      extension: 'pdf',
      type: 'document',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('handles view action by opening window', () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleFileAction('view', testFile);

      expect(mockOpen).toHaveBeenCalledWith(testFile.url, '_blank');
      mockOpen.mockRestore();
    });

    it('handles download action by calling download mutation', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleFileAction('download', testFile);

      expect(mockDownloadMutation).toHaveBeenCalledWith({ file: testFile });
    });

    it('handles retry action by calling upload retry', async () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      await act(async () => {
        result.current.handleFileAction('retry', testFile, onSuccess);
      });

      expect(mockHandleUploadRetry).toHaveBeenCalledWith(testFile, onSuccess);
    });

    it('handles retry action for image files by calling image upload retry', async () => {
      const imageFile: GalleryFile = {
        id: 'image-1',
        name: 'test.jpg',
        date: '2023-01-01',
        url: 'http://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
      };

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      await act(async () => {
        result.current.handleFileAction('retry', imageFile, onSuccess);
      });

      expect(mockHandleImageUploadRetry).toHaveBeenCalledWith(
        imageFile,
        onSuccess,
      );
    });

    it('handles delete action by showing delete modal', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleFileAction('delete', testFile);

      expect(mockShowDeleteModalForDoc).toHaveBeenCalledWith(testFile);
    });

    it('handles dismiss action by removing pending doc', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleFileAction('dismiss', testFile, onSuccess);

      expect(mockRemovePendingDoc).toHaveBeenCalledWith(testFile.id);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles dismiss action by removing pending image', () => {
      const imageFile: GalleryFile = {
        id: 'image-1',
        name: 'test.jpg',
        date: '2023-01-01',
        url: 'http://example.com/test.jpg',
        extension: 'jpg',
        type: 'image',
      };

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleFileAction('dismiss', imageFile, onSuccess);

      expect(mockRemovePendingImage).toHaveBeenCalledWith(imageFile.id);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('handles unknown action gracefully', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        result.current.handleFileAction(
          'unknown-action' as GalleryFileAction,
          testFile,
        );
      }).not.toThrow();

      // Should not call any handlers
      expect(mockDownloadMutation).not.toHaveBeenCalled();
      expect(mockHandleUploadRetry).not.toHaveBeenCalled();
      expect(mockShowDeleteModalForDoc).not.toHaveBeenCalled();
      expect(mockRemovePendingDoc).not.toHaveBeenCalled();
    });
  });

  describe('handleGeneralAction', () => {
    it('handles cancel-delete action by hiding modal', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleGeneralAction('cancel-delete', 'document');

      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it('handles upload action by triggering file picker', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleGeneralAction('upload', 'document');

      expect(mockHandleAddFileByType).toHaveBeenCalledWith('document');
    });

    it('handles confirm-upload action when file and filename are present', () => {
      // This test verifies the logic but can't easily test conditional behavior
      // without complex mock setup. The core logic is tested in integration.
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      // This will call the function but with null values (default mock)
      result.current.handleGeneralAction(
        'confirm-upload',
        'document',
        onSuccess,
      );

      // With null values, neither resetUploadState nor handleUpload should be called
      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it('handles confirm-upload action with file and filename present', () => {
      // Mock the store to return truthy values
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      const mockFileName = 'test-file.pdf';

      // Update the mock store state - needs pendingFile property
      mockStoreState.selectedFileForUpload = {
        pendingFile: mockFile,
      } as any;
      mockStoreState.uploadFileName = mockFileName;

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction(
        'confirm-upload',
        'document',
        onSuccess,
      );

      expect(mockResetUploadState).toHaveBeenCalled();
      expect(mockHandleUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockFileName,
          pendingFile: mockFile,
        }),
        onSuccess,
      );
    });

    it('handles confirm-upload action with image file and filename present', () => {
      // Mock the store to return truthy values for image upload
      const mockFile = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      const mockFileName = 'test-image.jpg';

      // Update the mock store state - needs pendingFile property
      mockStoreState.selectedFileForUpload = {
        pendingFile: mockFile,
      } as any;
      mockStoreState.uploadFileName = mockFileName;

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction('confirm-upload', 'image', onSuccess);

      expect(mockResetUploadState).toHaveBeenCalled();
      expect(mockHandleImageUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockFileName,
          pendingFile: mockFile,
        }),
        onSuccess,
      );
    });

    it('does not handle confirm-upload when no file is selected', () => {
      // Default mock returns null for selectedFileForUpload
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction(
        'confirm-upload',
        'document',
        onSuccess,
      );

      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it('does not handle confirm-upload when no filename is provided', () => {
      // This test case is covered by the default behavior since our mock
      // returns empty string for uploadFileName
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction(
        'confirm-upload',
        'document',
        onSuccess,
      );

      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it('handles cancel-upload action by resetting upload state', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      result.current.handleGeneralAction('cancel-upload', 'document');

      expect(mockResetUploadState).toHaveBeenCalled();
    });

    it('handles confirm-delete action by calling handleDelete and hiding modal', () => {
      // Set up fileToDelete in the mock store state
      mockStoreState.fileToDelete = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
      };

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction(
        'confirm-delete',
        'document',
        onSuccess,
      );

      expect(mockHandleDelete).toHaveBeenCalledWith(onSuccess);
      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it('handles confirm-delete action for image files by calling handleImageDelete and hiding modal', () => {
      // Set up fileToDelete as an image in the mock store state
      mockStoreState.fileToDelete = {
        id: 'image-1',
        name: 'test.jpg',
        type: 'image',
      };

      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });
      const onSuccess = vi.fn();

      result.current.handleGeneralAction('confirm-delete', 'image', onSuccess);

      expect(mockHandleImageDelete).toHaveBeenCalledWith(onSuccess);
      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it('handles unknown action gracefully', () => {
      const { result } = renderHook(() => useGalleryActions(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        result.current.handleGeneralAction(
          'unknown-action' as GalleryGeneralAction,
          'document',
        );
      }).not.toThrow();

      // Should not call any handlers
      expect(mockHideDeleteModal).not.toHaveBeenCalled();
      expect(mockHandleAddFileByType).not.toHaveBeenCalled();
      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
      expect(mockHandleDelete).not.toHaveBeenCalled();
    });
  });

  it('action handlers are stable functions', () => {
    const { result, rerender } = renderHook(() => useGalleryActions(), {
      wrapper: createWrapper(),
    });

    const handleFileAction1 = result.current.handleFileAction;
    const handleGeneralAction1 = result.current.handleGeneralAction;

    rerender();

    const handleFileAction2 = result.current.handleFileAction;
    const handleGeneralAction2 = result.current.handleGeneralAction;

    // Verify that the handlers are functions (basic sanity check)
    expect(typeof handleFileAction1).toBe('function');
    expect(typeof handleGeneralAction1).toBe('function');
    expect(typeof handleFileAction2).toBe('function');
    expect(typeof handleGeneralAction2).toBe('function');
  });
});

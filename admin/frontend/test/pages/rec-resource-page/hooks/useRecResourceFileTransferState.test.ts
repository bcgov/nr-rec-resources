import { getMaxFilesByFileType } from '@/pages/rec-resource-page/helpers';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useRecResourceFileTransferState } from '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockStoreState,
  mockGetMaxFilesByFileType,
  mockDocumentListState,
  mockImageListState,
  mockGalleryActions,
  mockFileNameValidation,
} = vi.hoisted(() => ({
  mockStoreState: {
    showUploadOverlay: false,
    showDeleteModal: false,
    fileToDelete: undefined,
    uploadFileName: '',
    selectedFileForUpload: null,
    pendingDocs: [] as any[],
    galleryDocuments: [] as any[],
    pendingImages: [] as any[],
    galleryImages: [] as any[],
  },
  mockGetMaxFilesByFileType: vi.fn((fileType: 'document' | 'image') =>
    fileType === 'document' ? 5 : 5,
  ),
  mockDocumentListState: {
    galleryDocumentsFromServer: [] as any[],
    isFetching: false,
    refetch: vi.fn(),
  },
  mockImageListState: {
    galleryImagesFromServer: [] as any[],
    isFetching: false,
    refetch: vi.fn(),
  },
  mockGalleryActions: {
    handleFileAction: vi.fn(),
    handleGeneralAction: vi.fn(),
  },
  mockFileNameValidation: {
    fileNameError: undefined as string | undefined,
    validateFileName: vi.fn(),
    hasError: false,
    isValid: false,
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    authService: {
      getAccessToken: vi.fn().mockReturnValue('mock-token'),
    },
  }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useDocumentList', () => ({
  useDocumentList: () => mockDocumentListState,
}));

vi.mock('@/pages/rec-resource-page/hooks/useImageList', () => ({
  useImageList: () => mockImageListState,
}));

vi.mock('@/pages/rec-resource-page/hooks/useGalleryActions', () => ({
  useGalleryActions: () => mockGalleryActions,
}));

vi.mock('@/pages/rec-resource-page/hooks/useFileNameValidation', () => ({
  useFileNameValidation: () => mockFileNameValidation,
}));

vi.mock('@/pages/rec-resource-page/helpers', () => ({
  getMaxFilesByFileType: mockGetMaxFilesByFileType,
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: vi.fn(),
}));

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  recResourceFileTransferStore: {
    state: mockStoreState,
  },
  setGalleryDocuments: vi.fn(),
  setGalleryImages: vi.fn(),
}));

vi.mock('@tanstack/react-store', () => ({
  useStore: () => mockStoreState,
}));

// Create a wrapper with QueryClient for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useRecResourceFileTransferState', () => {
  const setGalleryByType = (fileType: 'document' | 'image', files: any[]) => {
    if (fileType === 'document') {
      mockStoreState.galleryDocuments = files;
      return;
    }

    mockStoreState.galleryImages = files;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMaxFilesByFileType).mockImplementation((fileType) =>
      fileType === 'document' ? 5 : 5,
    );

    // Mock useRecResource
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: 'test-id',
      recResource: { rec_resource_id: 'test-id' } as any,
      isLoading: false,
      error: null,
    });

    // Reset mock functions
    mockDocumentListState.galleryDocumentsFromServer = [];
    mockDocumentListState.isFetching = false;
    mockDocumentListState.refetch.mockReset();

    mockImageListState.galleryImagesFromServer = [];
    mockImageListState.isFetching = false;
    mockImageListState.refetch.mockReset();

    mockGalleryActions.handleFileAction.mockReset();
    mockGalleryActions.handleGeneralAction.mockReset();

    // Reset file name validation mock
    mockFileNameValidation.fileNameError = undefined;
    mockFileNameValidation.hasError = false;
    mockFileNameValidation.isValid = false;
    mockFileNameValidation.validateFileName.mockReset();

    mockStoreState.showUploadOverlay = false;
    mockStoreState.showDeleteModal = false;
    mockStoreState.fileToDelete = undefined;
    mockStoreState.uploadFileName = '';
    mockStoreState.selectedFileForUpload = null;
    mockStoreState.pendingDocs = [];
    mockStoreState.galleryDocuments = [];
    mockStoreState.pendingImages = [];
    mockStoreState.galleryImages = [];
  });

  it('returns state and handlers from composed hooks', () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toMatchObject({
      // Gallery action handlers
      getDocumentFileActionHandler: expect.any(Function),
      getDocumentGeneralActionHandler: expect.any(Function),
      getImageFileActionHandler: expect.any(Function),
      getImageGeneralActionHandler: expect.any(Function),

      // Document list
      galleryDocuments: expect.any(Array),
      isDocumentMaxFilesReached: expect.any(Boolean),
      isDocumentUploadDisabled: expect.any(Boolean),
      isFetching: expect.any(Boolean),

      // Image list
      galleryImages: expect.any(Array),
      isImageMaxFilesReached: expect.any(Boolean),
      isImageUploadDisabled: expect.any(Boolean),
      isFetchingImages: expect.any(Boolean),

      // Upload modal state
      uploadModalState: {
        showUploadOverlay: expect.any(Boolean),
        uploadFileName: expect.any(String),
        selectedFileForUpload: null,
        fileNameError: undefined,
      },

      // Delete modal state
      deleteModalState: {
        showDeleteModal: expect.any(Boolean),
        fileToDelete: undefined,
      },
    });
  });

  it('delegates document file actions to gallery actions hook', () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const testFile = { id: '1', name: 'test.pdf' } as any;
    const actionHandler = result.current.getDocumentFileActionHandler(
      'view',
      testFile,
    );

    actionHandler();

    expect(mockGalleryActions.handleFileAction).toHaveBeenCalledWith(
      'view',
      testFile,
      mockDocumentListState.refetch,
    );
  });

  it('delegates document general actions to gallery actions hook', () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const actionHandler =
      result.current.getDocumentGeneralActionHandler('upload');

    actionHandler();

    expect(mockGalleryActions.handleGeneralAction).toHaveBeenCalledWith(
      'upload',
      'document',
      mockDocumentListState.refetch,
    );
  });

  it('delegates image file actions to gallery actions hook', () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const testFile = { id: '1', name: 'test.jpg' } as any;
    const actionHandler = result.current.getImageFileActionHandler(
      'view',
      testFile,
    );

    actionHandler();

    expect(mockGalleryActions.handleFileAction).toHaveBeenCalledWith(
      'view',
      testFile,
      mockImageListState.refetch,
    );
  });

  it('delegates image general actions to gallery actions hook', () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const actionHandler = result.current.getImageGeneralActionHandler('upload');

    actionHandler();

    expect(mockGalleryActions.handleGeneralAction).toHaveBeenCalledWith(
      'upload',
      'image',
      mockImageListState.refetch,
    );
  });

  it.each([
    {
      name: 'disables document upload at max files',
      fileType: 'document' as const,
      max: 2,
      files: [{ id: '1' }, { id: '2' }],
      expectedMaxReached: true,
      expectedDisabled: true,
      maxReachedKey: 'isDocumentMaxFilesReached' as const,
      uploadDisabledKey: 'isDocumentUploadDisabled' as const,
    },
    {
      name: 'disables document upload when a file is uploading below max',
      fileType: 'document' as const,
      max: 3,
      files: [
        { id: '1', isUploading: true },
        { id: '2', isUploading: false },
      ],
      expectedMaxReached: false,
      expectedDisabled: true,
      maxReachedKey: 'isDocumentMaxFilesReached' as const,
      uploadDisabledKey: 'isDocumentUploadDisabled' as const,
    },
    {
      name: 'keeps document upload enabled below max without uploading files',
      fileType: 'document' as const,
      max: 3,
      files: [{ id: '1' }, { id: '2' }],
      expectedMaxReached: false,
      expectedDisabled: false,
      maxReachedKey: 'isDocumentMaxFilesReached' as const,
      uploadDisabledKey: 'isDocumentUploadDisabled' as const,
    },
    {
      name: 'disables image upload at max files',
      fileType: 'image' as const,
      max: 2,
      files: [{ id: '1' }, { id: '2' }],
      expectedMaxReached: true,
      expectedDisabled: true,
      maxReachedKey: 'isImageMaxFilesReached' as const,
      uploadDisabledKey: 'isImageUploadDisabled' as const,
    },
    {
      name: 'disables image upload when a file is uploading below max',
      fileType: 'image' as const,
      max: 3,
      files: [
        { id: '1', isUploading: true },
        { id: '2', isUploading: false },
      ],
      expectedMaxReached: false,
      expectedDisabled: true,
      maxReachedKey: 'isImageMaxFilesReached' as const,
      uploadDisabledKey: 'isImageUploadDisabled' as const,
    },
    {
      name: 'keeps image upload enabled below max without uploading files',
      fileType: 'image' as const,
      max: 3,
      files: [{ id: '1' }, { id: '2' }],
      expectedMaxReached: false,
      expectedDisabled: false,
      maxReachedKey: 'isImageMaxFilesReached' as const,
      uploadDisabledKey: 'isImageUploadDisabled' as const,
    },
  ])(
    '$name',
    ({
      fileType,
      max,
      files,
      expectedMaxReached,
      expectedDisabled,
      maxReachedKey,
      uploadDisabledKey,
    }) => {
      vi.mocked(getMaxFilesByFileType).mockImplementation((currentType) =>
        currentType === fileType ? max : 5,
      );
      setGalleryByType(fileType, files as any[]);

      const { result } = renderHook(() => useRecResourceFileTransferState(), {
        wrapper: createWrapper(),
      });

      expect(result.current[maxReachedKey]).toBe(expectedMaxReached);
      expect(result.current[uploadDisabledKey]).toBe(expectedDisabled);
    },
  );

  it('includes file name validation properties in upload modal state', () => {
    // Set up mock with validation error
    mockFileNameValidation.fileNameError = 'Test error';
    mockFileNameValidation.hasError = true;
    mockFileNameValidation.isValid = false;

    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.uploadModalState.fileNameError).toBe('Test error');
  });
});

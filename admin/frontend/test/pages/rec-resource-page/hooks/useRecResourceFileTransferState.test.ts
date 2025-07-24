import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDocumentListState = {
  galleryDocumentsFromServer: [] as any[],
  isFetching: false,
  refetch: vi.fn(),
};

const mockImageListState = {
  galleryImagesFromServer: [] as any[],
  isFetching: false,
  refetch: vi.fn(),
};

const mockGalleryActions = {
  handleFileAction: vi.fn(),
  handleGeneralAction: vi.fn(),
};

const mockFileNameValidation = {
  fileNameError: undefined as string | undefined,
  validateFileName: vi.fn(),
  hasError: false,
  isValid: false,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: () => ({
    authService: {
      getAccessToken: vi.fn().mockReturnValue("mock-token"),
    },
  }),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentList", () => ({
  useDocumentList: () => mockDocumentListState,
}));

vi.mock("@/pages/rec-resource-page/hooks/useImageList", () => ({
  useImageList: () => mockImageListState,
}));

vi.mock("@/pages/rec-resource-page/hooks/useGalleryActions", () => ({
  useGalleryActions: () => mockGalleryActions,
}));

vi.mock("@/pages/rec-resource-page/hooks/useFileNameValidation", () => ({
  useFileNameValidation: () => mockFileNameValidation,
}));

vi.mock("@/pages/rec-resource-page/helpers", () => ({
  getMaxFilesByFileType: vi.fn().mockReturnValue(5),
}));

vi.mock("@/pages/rec-resource-page/hooks/useRecResource", () => ({
  useRecResource: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {
    state: {
      showUploadOverlay: false,
      showDeleteModal: false,
      docToDelete: null,
      uploadFileName: "",
      selectedFileForUpload: null,
      pendingDocs: [],
      galleryDocuments: [],
      pendingImages: [],
      galleryImages: [],
    },
  },
  setGalleryDocuments: vi.fn(),
  setGalleryImages: vi.fn(),
}));

vi.mock("@tanstack/react-store", () => ({
  useStore: () => ({
    showUploadOverlay: false,
    showDeleteModal: false,
    docToDelete: null,
    uploadFileName: "",
    selectedFileForUpload: null,
    pendingDocs: [],
    galleryDocuments: [],
    pendingImages: [],
    galleryImages: [],
  }),
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

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useRecResourceFileTransferState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRecResource
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "test-id",
      recResource: { rec_resource_id: "test-id" } as any,
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
  });

  it("returns state and handlers from composed hooks", () => {
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
      isDocumentUploadDisabled: expect.any(Boolean),
      isFetching: expect.any(Boolean),

      // Image list
      galleryImages: expect.any(Array),
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

  it("delegates document file actions to gallery actions hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const testFile = { id: "1", name: "test.pdf" } as any;
    const actionHandler = result.current.getDocumentFileActionHandler(
      "view",
      testFile,
    );

    actionHandler();

    expect(mockGalleryActions.handleFileAction).toHaveBeenCalledWith(
      "view",
      testFile,
      mockDocumentListState.refetch,
    );
  });

  it("delegates document general actions to gallery actions hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const actionHandler =
      result.current.getDocumentGeneralActionHandler("upload");

    actionHandler();

    expect(mockGalleryActions.handleGeneralAction).toHaveBeenCalledWith(
      "upload",
      "document",
      mockDocumentListState.refetch,
    );
  });

  it("delegates image file actions to gallery actions hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const testFile = { id: "1", name: "test.jpg" } as any;
    const actionHandler = result.current.getImageFileActionHandler(
      "view",
      testFile,
    );

    actionHandler();

    expect(mockGalleryActions.handleFileAction).toHaveBeenCalledWith(
      "view",
      testFile,
      mockImageListState.refetch,
    );
  });

  it("delegates image general actions to gallery actions hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    const actionHandler = result.current.getImageGeneralActionHandler("upload");

    actionHandler();

    expect(mockGalleryActions.handleGeneralAction).toHaveBeenCalledWith(
      "upload",
      "image",
      mockImageListState.refetch,
    );
  });

  it("returns values from all composed hooks", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    // Verify it includes properties from document list hook
    expect(result.current.galleryDocuments).toEqual([]);
    expect(result.current.isFetching).toBe(false);

    // Verify it includes properties from image list hook
    expect(result.current.galleryImages).toEqual([]);
    expect(result.current.isFetchingImages).toBe(false);

    // Verify upload modal state structure
    expect(result.current.uploadModalState).toEqual({
      showUploadOverlay: false,
      uploadFileName: "",
      selectedFileForUpload: null,
      fileNameError: undefined,
    });

    // Verify delete modal state structure
    expect(result.current.deleteModalState).toEqual({
      showDeleteModal: false,
      fileToDelete: undefined,
    });
  });

  it("calculates document upload disabled state based on max files", () => {
    // Mock getMaxFilesByFileType to return 2 for this test
    const mockGetMaxFiles = vi.fn().mockReturnValue(2);
    vi.doMock("@/pages/rec-resource-page/helpers", () => ({
      getMaxFilesByFileType: mockGetMaxFiles,
    }));

    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    // With 0 documents, should not be disabled
    expect(result.current.isDocumentUploadDisabled).toBe(false);
  });

  it("calculates image upload disabled state based on max files", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    // With 0 images and max of 5, should not be disabled
    expect(result.current.isImageUploadDisabled).toBe(false);
  });

  it("includes file name validation properties in upload modal state", () => {
    // Set up mock with validation error
    mockFileNameValidation.fileNameError = "Test error";
    mockFileNameValidation.hasError = true;
    mockFileNameValidation.isValid = false;

    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.uploadModalState.fileNameError).toBe("Test error");
  });
});

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

const mockGalleryActions = {
  handleFileAction: vi.fn(),
  handleGeneralAction: vi.fn(),
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

vi.mock("@/pages/rec-resource-page/hooks/useGalleryActions", () => ({
  useGalleryActions: () => mockGalleryActions,
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
    },
  },
  setGalleryDocuments: vi.fn(),
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

    mockGalleryActions.handleFileAction.mockReset();
    mockGalleryActions.handleGeneralAction.mockReset();
  });

  it("returns state and handlers from composed hooks", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toMatchObject({
      // Gallery action handlers
      getDocumentFileActionHandler: expect.any(Function),
      getDocumentGeneralActionHandler: expect.any(Function),

      // Document list
      galleryDocuments: expect.any(Array),
      isDocumentUploadDisabled: expect.any(Boolean),
      isFetching: expect.any(Boolean),

      // Upload modal state
      uploadModalState: {
        showUploadOverlay: expect.any(Boolean),
        uploadFileName: expect.any(String),
        selectedFileForUpload: null,
      },

      // Delete modal state
      deleteModalState: {
        showDeleteModal: expect.any(Boolean),
        docToDelete: null,
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
      mockDocumentListState.refetch,
    );
  });

  it("returns values from all composed hooks", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState(), {
      wrapper: createWrapper(),
    });

    // Verify it includes properties from document list hook
    expect(result.current.galleryDocuments).toEqual([]);
    expect(result.current.isFetching).toBe(false);

    // Verify upload modal state structure
    expect(result.current.uploadModalState).toEqual({
      showUploadOverlay: false,
      uploadFileName: "",
      selectedFileForUpload: null,
    });

    // Verify delete modal state structure
    expect(result.current.deleteModalState).toEqual({
      showDeleteModal: false,
      docToDelete: null,
    });
  });
});

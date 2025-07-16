import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all the smaller hooks that the main hook now depends on
const mockFilePickerState = {
  handleAddFileClick: vi.fn(),
};

const mockDocumentListState = {
  galleryDocuments: [] as any[],
  isDocumentUploadDisabled: false,
  isFetching: false,
  refetch: vi.fn(),
};

const mockGalleryActions = {
  getActionHandler: vi.fn(() => vi.fn()),
  uploadModalState: {
    showUploadModal: false,
    resetUploadModal: vi.fn(),
  },
};

const mockDeleteModalState = {
  showDeleteModal: false,
  docToDelete: undefined as any,
  setShowDeleteModal: vi.fn(),
  setDocToDelete: vi.fn(),
};

vi.mock("@/pages/rec-resource-page/hooks/useFilePickerState", () => ({
  useFilePickerState: () => mockFilePickerState,
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentListState", () => ({
  useDocumentListState: () => mockDocumentListState,
}));

vi.mock("@/pages/rec-resource-page/hooks/useGalleryActions", () => ({
  useGalleryActions: () => mockGalleryActions,
}));

vi.mock("@/pages/rec-resource-page/hooks/useDeleteModalState", () => ({
  useDeleteModalState: () => mockDeleteModalState,
}));

vi.mock("@tanstack/react-store", () => ({
  useStore: () => ({ recResource: { rec_resource_id: "abc" } }),
}));

beforeEach(() => {
  vi.clearAllMocks();

  // Reset mock functions
  mockFilePickerState.handleAddFileClick.mockReset();

  mockDocumentListState.galleryDocuments = [];
  mockDocumentListState.isDocumentUploadDisabled = false;
  mockDocumentListState.isFetching = false;
  mockDocumentListState.refetch.mockReset();

  mockGalleryActions.getActionHandler.mockReset();
  mockGalleryActions.getActionHandler.mockReturnValue(vi.fn());
  mockGalleryActions.uploadModalState = {
    showUploadModal: false,
    resetUploadModal: vi.fn(),
  };

  mockDeleteModalState.showDeleteModal = false;
  mockDeleteModalState.docToDelete = undefined;
  mockDeleteModalState.setShowDeleteModal.mockReset();
  mockDeleteModalState.setDocToDelete.mockReset();
});

describe("useRecResourceFileTransferState", () => {
  it("returns state and handlers from composed hooks", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    expect(result.current).toMatchObject({
      // From useGalleryActions
      getActionHandler: expect.any(Function),
      uploadModalState: expect.objectContaining({
        showUploadModal: false,
        resetUploadModal: expect.any(Function),
      }),

      // From useDocumentListState
      galleryDocuments: [],
      isDocumentUploadDisabled: false,
      isFetching: false,
      refetch: expect.any(Function),

      // From useDeleteModalState
      showDeleteModal: false,
      docToDelete: undefined,
      setShowDeleteModal: expect.any(Function),
      setDocToDelete: expect.any(Function),

      // From useFilePickerState
      handleAddFileClick: expect.any(Function),
    });
  });

  it("delegates handleAddFileClick to file picker hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    result.current.handleAddFileClick();

    expect(mockFilePickerState.handleAddFileClick).toHaveBeenCalled();
  });

  it("getActionHandler delegates to gallery actions hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const refetch = vi.fn();

    result.current.getActionHandler(refetch);

    expect(mockGalleryActions.getActionHandler).toHaveBeenCalledWith(refetch);
  });

  it("delegates delete modal methods to delete modal hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const testDoc = {
      id: "1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://test",
      extension: "pdf",
    };

    result.current.setShowDeleteModal(true);
    expect(mockDeleteModalState.setShowDeleteModal).toHaveBeenCalledWith(true);

    result.current.setDocToDelete(testDoc);
    expect(mockDeleteModalState.setDocToDelete).toHaveBeenCalledWith(testDoc);
  });

  it("returns values from all composed hooks", () => {
    // Update mock states to test different values
    mockDocumentListState.galleryDocuments = [{ id: "1", name: "Gallery Doc" }];
    mockDocumentListState.isDocumentUploadDisabled = true;
    mockDocumentListState.isFetching = true;

    mockGalleryActions.uploadModalState = {
      showUploadModal: true,
      resetUploadModal: vi.fn(),
    };

    mockDeleteModalState.showDeleteModal = true;
    mockDeleteModalState.docToDelete = { id: "delete-me", name: "To Delete" };

    const { result } = renderHook(() => useRecResourceFileTransferState());

    expect(result.current.galleryDocuments).toEqual([
      { id: "1", name: "Gallery Doc" },
    ]);
    expect(result.current.isDocumentUploadDisabled).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.uploadModalState.showUploadModal).toBe(true);
    expect(result.current.showDeleteModal).toBe(true);
    expect(result.current.docToDelete).toEqual({
      id: "delete-me",
      name: "To Delete",
    });
  });
});

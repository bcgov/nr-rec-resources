import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all the smaller hooks that the main hook now depends on
const mockFilePickerState = {
  selectedFile: null as File | null,
  uploadFileName: "",
  showUploadOverlay: false,
  handleAddFileClick: vi.fn(),
  handleCancelUpload: vi.fn(),
  setUploadFileName: vi.fn(),
};

const mockDocumentListState = {
  pendingDocs: [] as any[],
  galleryDocuments: [] as any[],
  isDocumentUploadDisabled: false,
  isFetching: false,
  refetch: vi.fn(),
};

const mockDocumentUpload = {
  handleUpload: vi.fn(),
};

const mockGalleryActions = {
  getActionHandler: vi.fn(() => vi.fn()),
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

vi.mock("@/pages/rec-resource-page/hooks/useDocumentUpload", () => ({
  useDocumentUpload: () => mockDocumentUpload,
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

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  setShowUploadOverlay: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();

  // Reset all mock states
  mockFilePickerState.selectedFile = null;
  mockFilePickerState.uploadFileName = "";
  mockFilePickerState.showUploadOverlay = false;
  mockFilePickerState.handleAddFileClick.mockReset();
  mockFilePickerState.handleCancelUpload.mockReset();
  mockFilePickerState.setUploadFileName.mockReset();

  mockDocumentListState.pendingDocs = [];
  mockDocumentListState.galleryDocuments = [];
  mockDocumentListState.isDocumentUploadDisabled = false;
  mockDocumentListState.isFetching = false;
  mockDocumentListState.refetch.mockReset();

  mockDocumentUpload.handleUpload.mockReset();

  mockGalleryActions.getActionHandler.mockReset();
  mockGalleryActions.getActionHandler.mockReturnValue(vi.fn());

  mockDeleteModalState.showDeleteModal = false;
  mockDeleteModalState.docToDelete = undefined;
  mockDeleteModalState.setShowDeleteModal.mockReset();
  mockDeleteModalState.setDocToDelete.mockReset();
});

describe("useRecResourceFileTransferState", () => {
  it("returns state and handlers from composed hooks", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    expect(result.current).toMatchObject({
      // From useFilePickerState
      selectedFile: null,
      uploadFileName: "",
      showUploadOverlay: false,
      handleAddFileClick: expect.any(Function),
      handleCancelUpload: expect.any(Function),
      setUploadFileName: expect.any(Function),

      // From useDocumentListState
      pendingDocs: [],
      galleryDocuments: [],
      isDocumentUploadDisabled: false,
      isFetching: false,
      refetch: expect.any(Function),

      // From useDeleteModalState
      showDeleteModal: false,
      docToDelete: undefined,
      setShowDeleteModal: expect.any(Function),
      setDocToDelete: expect.any(Function),

      // Composed handlers
      getUploadHandler: expect.any(Function),
      getActionHandler: expect.any(Function),
    });
  });

  it("delegates handleAddFileClick to file picker hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    result.current.handleAddFileClick();

    expect(mockFilePickerState.handleAddFileClick).toHaveBeenCalled();
  });

  it("delegates handleCancelUpload to file picker hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    result.current.handleCancelUpload();

    expect(mockFilePickerState.handleCancelUpload).toHaveBeenCalled();
  });

  it("delegates setUploadFileName to file picker hook", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());

    result.current.setUploadFileName("test.pdf");

    expect(mockFilePickerState.setUploadFileName).toHaveBeenCalledWith(
      "test.pdf",
    );
  });

  it("getUploadHandler calls document upload hook and resets overlay", async () => {
    mockFilePickerState.selectedFile = new File(["content"], "test.pdf");
    mockFilePickerState.uploadFileName = "Test Document";

    const { result } = renderHook(() => useRecResourceFileTransferState());
    const onSuccess = vi.fn();

    const uploadHandler = result.current.getUploadHandler(
      "resource-123",
      onSuccess,
    );
    await act(() => uploadHandler());

    expect(mockDocumentUpload.handleUpload).toHaveBeenCalledWith(
      mockFilePickerState.selectedFile,
      mockFilePickerState.uploadFileName,
      onSuccess,
      mockFilePickerState.handleCancelUpload,
    );
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
    mockFilePickerState.selectedFile = new File(["test"], "test.pdf");
    mockFilePickerState.uploadFileName = "Test File";
    mockFilePickerState.showUploadOverlay = true;

    mockDocumentListState.pendingDocs = [
      { id: "pending-1", name: "Pending Doc" },
    ];
    mockDocumentListState.galleryDocuments = [{ id: "1", name: "Gallery Doc" }];
    mockDocumentListState.isDocumentUploadDisabled = true;
    mockDocumentListState.isFetching = true;

    mockDeleteModalState.showDeleteModal = true;
    mockDeleteModalState.docToDelete = { id: "delete-me", name: "To Delete" };

    const { result } = renderHook(() => useRecResourceFileTransferState());

    expect(result.current.selectedFile).toBe(mockFilePickerState.selectedFile);
    expect(result.current.uploadFileName).toBe("Test File");
    expect(result.current.showUploadOverlay).toBe(true);
    expect(result.current.pendingDocs).toEqual([
      { id: "pending-1", name: "Pending Doc" },
    ]);
    expect(result.current.galleryDocuments).toEqual([
      { id: "1", name: "Gallery Doc" },
    ]);
    expect(result.current.isDocumentUploadDisabled).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.showDeleteModal).toBe(true);
    expect(result.current.docToDelete).toEqual({
      id: "delete-me",
      name: "To Delete",
    });
  });
});

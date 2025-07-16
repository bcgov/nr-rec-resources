import { useGalleryActions } from "@/pages/rec-resource-page/hooks/useGalleryActions";
import {
  GalleryFile,
  GalleryFileAction,
} from "@/pages/rec-resource-page/types";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - declare as hoisted mocks
vi.mock("@/pages/rec-resource-page/hooks/useDownloadFileMutation", () => ({
  useDownloadFileMutation: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentUpload", () => ({
  useDocumentUpload: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDeleteModalState", () => ({
  useDeleteModalState: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentDelete", () => ({
  useDocumentDelete: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useFilePickerState", () => ({
  useFilePickerState: vi.fn(),
}));

vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {},
  setSelectedFile: vi.fn(),
  setShowUploadOverlay: vi.fn(),
  setUploadFileName: vi.fn(),
}));

// Import mocked modules for type safety
import { useDeleteModalState } from "@/pages/rec-resource-page/hooks/useDeleteModalState";
import { useDocumentDelete } from "@/pages/rec-resource-page/hooks/useDocumentDelete";
import { useDocumentUpload } from "@/pages/rec-resource-page/hooks/useDocumentUpload";
import { useFileDownload } from "@/pages/rec-resource-page/hooks/useFileDownload";
import { useFilePickerState } from "@/pages/rec-resource-page/hooks/useFilePickerState";

const mockDownloadMutation = vi.fn();
const mockHandleUploadRetry = vi.fn();
const mockHandleUpload = vi.fn();
const mockHandleDelete = vi.fn();
const mockShowDeleteModalForDoc = vi.fn();
const mockHideDeleteModal = vi.fn();
const mockHandleAddFileClick = vi.fn();
const mockHandleCancelUpload = vi.fn();
const mockSetUploadFileName = vi.fn();

const mockFilePickerState = {
  selectedFile: null,
  uploadFileName: "",
  showUploadOverlay: false,
  handleAddFileClick: mockHandleAddFileClick,
  handleCancelUpload: mockHandleCancelUpload,
  setUploadFileName: mockSetUploadFileName,
};

describe("useGalleryActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the file picker state
    vi.mocked(useFilePickerState).mockReturnValue(mockFilePickerState);

    // Mock the hook returns
    vi.mocked(useFileDownload).mockReturnValue({
      mutate: mockDownloadMutation,
    } as any);

    vi.mocked(useDocumentUpload).mockReturnValue({
      handleUploadRetry: mockHandleUploadRetry,
      handleUpload: mockHandleUpload,
    } as any);

    vi.mocked(useDocumentDelete).mockReturnValue({
      handleDelete: mockHandleDelete,
      isDeleting: false,
    } as any);

    vi.mocked(useDeleteModalState).mockReturnValue({
      showDeleteModalForDoc: mockShowDeleteModalForDoc,
      hideDeleteModal: mockHideDeleteModal,
    } as any);
  });

  it("returns action handler and upload modal state", () => {
    const { result } = renderHook(() => useGalleryActions());

    expect(result.current).toMatchObject({
      getActionHandler: expect.any(Function),
      uploadModalState: {
        showUploadModal: false,
        selectedFile: null,
        uploadFileName: "",
        setUploadFileName: expect.any(Function),
      },
    });
  });

  describe("gallery actions", () => {
    const testFile: GalleryFile = {
      id: "file-1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
    };

    it("handles view action by opening window", () => {
      const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("view", testFile);

      expect(mockOpen).toHaveBeenCalledWith(testFile.url, "_blank");
      mockOpen.mockRestore();
    });

    it("handles download action by calling download mutation", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("download", testFile);

      expect(mockDownloadMutation).toHaveBeenCalledWith({ file: testFile });
    });

    it("handles retry action by calling upload retry", async () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      await act(async () => {
        actionHandler("retry", testFile);
      });

      expect(mockHandleUploadRetry).toHaveBeenCalledWith(testFile, refetch);
    });

    it("handles delete action by showing delete modal", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("delete", testFile);

      expect(mockShowDeleteModalForDoc).toHaveBeenCalledWith(testFile);
    });

    it("handles confirm-delete action by calling handleDelete, hiding modal and refetching", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("confirm-delete", testFile);

      expect(mockHandleDelete).toHaveBeenCalledWith(testFile, refetch);
      expect(mockHideDeleteModal).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });

    it("handles cancel-delete action by hiding modal", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("cancel-delete", testFile);

      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it("handles upload action by triggering file picker", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("upload", testFile);

      expect(mockHandleAddFileClick).toHaveBeenCalled();
    });

    it("handles confirm-upload action when file and filename are present", () => {
      // Update file picker state to have selected file and filename
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });
      vi.mocked(useFilePickerState).mockReturnValue({
        ...mockFilePickerState,
        selectedFile: mockFile,
        uploadFileName: "test-file",
      });

      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("confirm-upload", testFile);

      expect(mockHandleUpload).toHaveBeenCalledWith(
        mockFile,
        "test-file",
        refetch,
        expect.any(Function),
      );
    });

    it("handles cancel-upload action by hiding upload modal", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);
      actionHandler("cancel-upload", testFile);

      expect(mockHandleCancelUpload).toHaveBeenCalled();
    });

    it("handles unknown action gracefully", () => {
      const { result } = renderHook(() => useGalleryActions());
      const refetch = vi.fn();

      const actionHandler = result.current.getActionHandler(refetch);

      // Should not throw for unknown action
      expect(() => {
        actionHandler("unknown-action" as GalleryFileAction, testFile);
      }).not.toThrow();

      // Should not call any handlers
      expect(mockDownloadMutation).not.toHaveBeenCalled();
      expect(mockHandleUploadRetry).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
      expect(mockShowDeleteModalForDoc).not.toHaveBeenCalled();
      expect(mockHideDeleteModal).not.toHaveBeenCalled();
      expect(mockHandleAddFileClick).not.toHaveBeenCalled();
      expect(mockHandleCancelUpload).not.toHaveBeenCalled();
      expect(refetch).not.toHaveBeenCalled();
    });
  });

  it("getActionHandler returns function that calls handleGalleryAction with provided refetch", () => {
    const { result } = renderHook(() => useGalleryActions());
    const refetch = vi.fn();

    const actionHandler = result.current.getActionHandler(refetch);

    expect(typeof actionHandler).toBe("function");

    // Test that the returned function works correctly
    const testFile: GalleryFile = {
      id: "file-1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
    };

    actionHandler("download", testFile);
    expect(mockDownloadMutation).toHaveBeenCalledWith({ file: testFile });
  });

  it("memoizes getActionHandler function correctly", () => {
    const { result, rerender } = renderHook(() => useGalleryActions());

    const getActionHandler1 = result.current.getActionHandler;
    rerender();
    const getActionHandler2 = result.current.getActionHandler;

    // The getActionHandler function itself should be memoized
    expect(getActionHandler1).toBe(getActionHandler2);
  });
});

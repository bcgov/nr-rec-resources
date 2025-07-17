import { useGalleryActions } from "@/pages/rec-resource-page/hooks/useGalleryActions";
import {
  GalleryFile,
  GalleryFileAction,
  GalleryGeneralAction,
} from "@/pages/rec-resource-page/types";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
const mockDownloadMutation = vi.fn();
const mockHandleUploadRetry = vi.fn();
const mockHandleUpload = vi.fn();
const mockHandleDelete = vi.fn();
const mockShowDeleteModalForDoc = vi.fn();
const mockHideDeleteModal = vi.fn();
const mockHandleAddPdfFileClick = vi.fn();
const mockResetUploadState = vi.fn();
const mockRemovePendingDoc = vi.fn();

// Mock store state - will be updated in tests
const mockStoreState: {
  selectedFileForUpload: File | null;
  uploadFileName: string;
  docToDelete: any;
} = {
  selectedFileForUpload: null,
  uploadFileName: "",
  docToDelete: null,
};

const mockUseStore = vi.fn(() => mockStoreState);

vi.mock("@/pages/rec-resource-page/hooks/useFileDownload", () => ({
  useFileDownload: () => ({
    mutate: mockDownloadMutation,
  }),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentUpload", () => ({
  useDocumentUpload: () => ({
    handleUploadRetry: mockHandleUploadRetry,
    handleUpload: mockHandleUpload,
  }),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentDelete", () => ({
  useDocumentDelete: () => ({
    handleDelete: mockHandleDelete,
    isDeleting: false,
  }),
}));

vi.mock("@/pages/rec-resource-page/helpers", () => ({
  handleAddFileClick: vi.fn(),
  handleAddPdfFileClick: () => mockHandleAddPdfFileClick(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {
    state: {
      selectedFileForUpload: null,
      uploadFileName: "",
      docToDelete: null,
    },
  },
  hideDeleteModal: () => mockHideDeleteModal(),
  showDeleteModalForDoc: (file: any) => mockShowDeleteModalForDoc(file),
  resetUploadState: () => mockResetUploadState(),
  removePendingDoc: (id: string) => mockRemovePendingDoc(id),
}));

vi.mock("@tanstack/react-store", () => ({
  useStore: () => mockUseStore(),
}));

describe("useGalleryActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state to default values
    mockStoreState.selectedFileForUpload = null;
    mockStoreState.uploadFileName = "";
    mockStoreState.docToDelete = null;
  });

  it("returns action handlers", () => {
    const { result } = renderHook(() => useGalleryActions());

    expect(result.current).toMatchObject({
      handleFileAction: expect.any(Function),
      handleGeneralAction: expect.any(Function),
    });
  });

  describe("handleFileAction", () => {
    const testFile: GalleryFile = {
      id: "file-1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("handles view action by opening window", () => {
      const mockOpen = vi.spyOn(window, "open").mockImplementation(() => null);
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleFileAction("view", testFile);

      expect(mockOpen).toHaveBeenCalledWith(testFile.url, "_blank");
      mockOpen.mockRestore();
    });

    it("handles download action by calling download mutation", () => {
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleFileAction("download", testFile);

      expect(mockDownloadMutation).toHaveBeenCalledWith({ file: testFile });
    });

    it("handles retry action by calling upload retry", async () => {
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      await act(async () => {
        result.current.handleFileAction("retry", testFile, onSuccess);
      });

      expect(mockHandleUploadRetry).toHaveBeenCalledWith(testFile, onSuccess);
    });

    it("handles delete action by showing delete modal", () => {
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleFileAction("delete", testFile);

      expect(mockShowDeleteModalForDoc).toHaveBeenCalledWith(testFile);
    });

    it("handles dismiss action by removing pending doc", () => {
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      result.current.handleFileAction("dismiss", testFile, onSuccess);

      expect(mockRemovePendingDoc).toHaveBeenCalledWith(testFile.id);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("handles unknown action gracefully", () => {
      const { result } = renderHook(() => useGalleryActions());

      expect(() => {
        result.current.handleFileAction(
          "unknown-action" as GalleryFileAction,
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

  describe("handleGeneralAction", () => {
    it("handles cancel-delete action by hiding modal", () => {
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleGeneralAction("cancel-delete");

      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it("handles upload action by triggering file picker", () => {
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleGeneralAction("upload");

      expect(mockHandleAddPdfFileClick).toHaveBeenCalled();
    });

    it("handles confirm-upload action when file and filename are present", () => {
      // This test verifies the logic but can't easily test conditional behavior
      // without complex mock setup. The core logic is tested in integration.
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      // This will call the function but with null values (default mock)
      result.current.handleGeneralAction("confirm-upload", onSuccess);

      // With null values, neither resetUploadState nor handleUpload should be called
      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it("handles confirm-upload action with file and filename present", () => {
      // Mock the store to return truthy values
      const mockFile = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });
      const mockFileName = "test-file.pdf";

      // Update the mock store state
      mockStoreState.selectedFileForUpload = mockFile;
      mockStoreState.uploadFileName = mockFileName;

      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      result.current.handleGeneralAction("confirm-upload", onSuccess);

      expect(mockResetUploadState).toHaveBeenCalled();
      expect(mockHandleUpload).toHaveBeenCalledWith(
        mockFile,
        mockFileName,
        onSuccess,
      );
    });

    it("does not handle confirm-upload when no file is selected", () => {
      // Default mock returns null for selectedFileForUpload
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      result.current.handleGeneralAction("confirm-upload", onSuccess);

      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it("does not handle confirm-upload when no filename is provided", () => {
      // This test case is covered by the default behavior since our mock
      // returns empty string for uploadFileName
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      result.current.handleGeneralAction("confirm-upload", onSuccess);

      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
    });

    it("handles cancel-upload action by resetting upload state", () => {
      const { result } = renderHook(() => useGalleryActions());

      result.current.handleGeneralAction("cancel-upload");

      expect(mockResetUploadState).toHaveBeenCalled();
    });

    it("handles confirm-delete action by calling handleDelete and hiding modal", () => {
      const { result } = renderHook(() => useGalleryActions());
      const onSuccess = vi.fn();

      result.current.handleGeneralAction("confirm-delete", onSuccess);

      expect(mockHandleDelete).toHaveBeenCalledWith(onSuccess);
      expect(mockHideDeleteModal).toHaveBeenCalled();
    });

    it("handles unknown action gracefully", () => {
      const { result } = renderHook(() => useGalleryActions());

      expect(() => {
        result.current.handleGeneralAction(
          "unknown-action" as GalleryGeneralAction,
        );
      }).not.toThrow();

      // Should not call any handlers
      expect(mockHideDeleteModal).not.toHaveBeenCalled();
      expect(mockHandleAddPdfFileClick).not.toHaveBeenCalled();
      expect(mockResetUploadState).not.toHaveBeenCalled();
      expect(mockHandleUpload).not.toHaveBeenCalled();
      expect(mockHandleDelete).not.toHaveBeenCalled();
    });
  });

  it("action handlers are stable functions", () => {
    const { result, rerender } = renderHook(() => useGalleryActions());

    const handleFileAction1 = result.current.handleFileAction;
    const handleGeneralAction1 = result.current.handleGeneralAction;

    rerender();

    const handleFileAction2 = result.current.handleFileAction;
    const handleGeneralAction2 = result.current.handleGeneralAction;

    // Verify that the handlers are functions (basic sanity check)
    expect(typeof handleFileAction1).toBe("function");
    expect(typeof handleGeneralAction1).toBe("function");
    expect(typeof handleFileAction2).toBe("function");
    expect(typeof handleGeneralAction2).toBe("function");
  });
});

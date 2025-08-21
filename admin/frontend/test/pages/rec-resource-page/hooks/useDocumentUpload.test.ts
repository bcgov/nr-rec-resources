import { useDocumentUpload } from "@/pages/rec-resource-page/hooks/useDocumentUpload";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { GalleryFile } from "@/pages/rec-resource-page/types";
import * as notificationStore from "@/store/notificationStore";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn(),
}));

vi.mock("@/services/recreation-resource-admin", () => ({
  useUploadResourceDocument: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useRecResource", () => ({
  useRecResource: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  addPendingDoc: vi.fn(),
  removePendingDoc: vi.fn(),
  updatePendingDoc: vi.fn(),
}));

vi.mock("@/store/notificationStore", () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/helpers", () => ({
  handleAddFileByType: vi.fn(),
  handleAddFileClick: vi.fn(),
}));

vi.mock("@/services/utils/errorHandler", () => ({
  handleApiError: vi.fn(),
}));

// Import mocked modules for type safety
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useUploadResourceDocument } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";

const mockUploadMutation = vi.fn();
const mockRecResource = {
  rec_resource_id: "test-resource-123",
  name: "Test Resource",
  closest_community: "Test Community",
  recreation_activity: [],
  recreation_status: { status_code: 1, comment: "", description: "Open" },
  rec_resource_type: "RR",
  description: "Test description",
  driving_directions: "Test directions",
  maintenance_standard_code: "U" as const,
  campsite_count: 0,
  recreation_access: [],
  recreation_structure: { has_toilet: false, has_table: false },
};

describe("useDocumentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRecResource hook
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "test-resource-123",
      recResource: mockRecResource,
      isLoading: false,
      error: null,
    });

    // Mock upload mutation
    vi.mocked(useUploadResourceDocument).mockReturnValue({
      mutateAsync: mockUploadMutation,
    } as any);

    // Mock handleApiError to return expected error format
    vi.mocked(handleApiError).mockResolvedValue({
      statusCode: 500,
      message: "Upload failed",
      isResponseError: false,
      isAuthError: false,
    });
  });

  it("returns upload handlers", () => {
    const { result } = renderHook(() => useDocumentUpload());

    expect(result.current).toMatchObject({
      handleUpload: expect.any(Function),
      handleUploadRetry: expect.any(Function),
    });
  });

  describe("handleUpload", () => {
    it("uploads file successfully", async () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const galleryFile = {
        id: "temp-id",
        name: "Test Document",
        date: "2024-01-01",
        url: "",
        extension: "pdf",
        pendingFile: file,
        type: "document" as const,
      };
      const onSuccess = vi.fn();

      mockUploadMutation.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFile, onSuccess);
      });

      // Verify pending doc was added
      expect(store.addPendingDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Document",
          date: "2024-01-01",
          extension: "pdf",
          isUploading: true,
          pendingFile: file,
        }),
      );

      // Verify upload was called
      expect(mockUploadMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        file,
        title: "Test Document",
      });

      // Verify success flow
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        `File "Test Document" uploaded successfully.`,
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(store.removePendingDoc).toHaveBeenCalled();
    });

    it("handles upload error", async () => {
      const file = new File(["content"], "test.pdf");
      const galleryFile = {
        id: "temp-id",
        name: "Test Document",
        date: "2024-01-01",
        url: "",
        extension: "pdf",
        pendingFile: file,
        type: "document" as const,
      };
      const onSuccess = vi.fn();

      mockUploadMutation.mockRejectedValueOnce(new Error("Upload failed"));

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFile, onSuccess);
      });

      // Verify pending doc was added initially with formatted date
      expect(store.addPendingDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Document",
          date: "2024-01-01",
          extension: "pdf",
          isUploading: true,
          pendingFile: file,
        }),
      );

      // Verify error flow
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        `500 - Failed to upload file "Test Document": Upload failed. Please try again.`,
      );
      expect(store.updatePendingDoc).toHaveBeenCalledWith(expect.any(String), {
        isUploading: false,
        uploadFailed: true,
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does nothing if no file provided", async () => {
      const onSuccess = vi.fn();
      const galleryFileWithoutFile = {
        id: "temp-id",
        name: "filename",
        date: "2024-01-01",
        url: "",
        extension: "pdf",
        pendingFile: undefined,
        type: "document" as const,
      };

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFileWithoutFile, onSuccess);
      });

      expect(store.addPendingDoc).not.toHaveBeenCalled();
      expect(mockUploadMutation).not.toHaveBeenCalled();
    });

    it("does nothing if no filename provided", async () => {
      const file = new File(["content"], "test.pdf");
      const onSuccess = vi.fn();
      const galleryFileWithoutName = {
        id: "temp-id",
        name: "",
        date: "2024-01-01",
        url: "",
        extension: "pdf",
        pendingFile: file,
        type: "document" as const,
      };

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(galleryFileWithoutName, onSuccess);
      });

      expect(store.addPendingDoc).not.toHaveBeenCalled();
      expect(mockUploadMutation).not.toHaveBeenCalled();
    });
  });

  describe("handleUploadRetry", () => {
    it("retries upload successfully", async () => {
      const pendingFile = new File(["content"], "test.pdf");
      const pendingDoc: GalleryFile = {
        id: "pending-123",
        name: "Test Document",
        date: "2023-01-01",
        url: "",
        extension: "pdf",
        pendingFile,
        type: "document",
      };
      const onSuccess = vi.fn();

      mockUploadMutation.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc, onSuccess);
      });

      // Verify pending doc status was updated
      expect(store.updatePendingDoc).toHaveBeenCalledWith("pending-123", {
        isUploading: true,
        uploadFailed: false,
      });

      // Verify upload was called
      expect(mockUploadMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        file: pendingFile,
        title: "Test Document",
      });

      // Verify success flow
      expect(notificationStore.addSuccessNotification).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it("does nothing if no pending file", async () => {
      const pendingDoc: GalleryFile = {
        id: "pending-123",
        name: "Test Document",
        date: "2023-01-01",
        url: "",
        extension: "pdf",
        type: "document",
        // No pendingFile
      };
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc, onSuccess);
      });

      expect(store.updatePendingDoc).not.toHaveBeenCalled();
      expect(mockUploadMutation).not.toHaveBeenCalled();
    });

    it("handles retry upload error", async () => {
      const pendingFile = new File(["content"], "test.pdf");
      const pendingDoc: GalleryFile = {
        id: "pending-123",
        name: "Test Document",
        date: "2023-01-01",
        url: "",
        extension: "pdf",
        pendingFile,
        type: "document",
      };
      const onSuccess = vi.fn();

      mockUploadMutation.mockRejectedValueOnce(new Error("Upload failed"));

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc, onSuccess);
      });

      // Verify error flow
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        `500 - Failed to upload file "Test Document": Upload failed. Please try again.`,
      );
      expect(store.updatePendingDoc).toHaveBeenCalledWith("pending-123", {
        isUploading: false,
        uploadFailed: true,
      });
    });
  });

  it("does nothing when recResource is undefined", async () => {
    // Mock useRecResource to return undefined recResource
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "test-resource-123",
      recResource: undefined,
      isLoading: false,
      error: null,
    });

    const file = new File(["content"], "test.pdf");
    const galleryFile: GalleryFile = {
      id: "test-123",
      name: "test.pdf",
      date: "2023-01-01",
      url: "",
      extension: "pdf",
      pendingFile: file,
      type: "document",
    };
    const onSuccess = vi.fn();
    mockUploadMutation.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.handleUpload(galleryFile, onSuccess);
    });

    expect(mockUploadMutation).not.toHaveBeenCalled();
    expect(store.addPendingDoc).not.toHaveBeenCalled();
  });
});

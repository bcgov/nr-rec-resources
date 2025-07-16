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

vi.mock(
  "@/services/hooks/recreation-resource-admin/useUploadResourceDocument",
  () => ({
    useUploadResourceDocument: vi.fn(),
  }),
);

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  addPendingDoc: vi.fn(),
  removePendingDoc: vi.fn(),
  updatePendingDoc: vi.fn(),
}));

vi.mock("@/store/notificationStore", () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

// Import mocked modules for type safety
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { useStore } from "@tanstack/react-store";

const mockUploadMutation = vi.fn();
const mockRecResource = { rec_resource_id: "test-resource-123" };

describe("useDocumentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useStore to return test resource
    vi.mocked(useStore).mockReturnValue({
      recResource: mockRecResource,
    });

    // Mock upload mutation
    vi.mocked(useUploadResourceDocument).mockReturnValue({
      mutateAsync: mockUploadMutation,
    } as any);
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
      const uploadFileName = "Test Document";
      const onSuccess = vi.fn();
      const onCancel = vi.fn();

      mockUploadMutation.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(
          file,
          uploadFileName,
          onSuccess,
          onCancel,
        );
      });

      // Verify pending doc was added
      expect(store.addPendingDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          name: uploadFileName,
          extension: "pdf",
          isUploading: true,
          pendingFile: file,
        }),
      );

      // Verify upload was called
      expect(mockUploadMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        file,
        title: uploadFileName,
      });

      // Verify success flow
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        `File "${uploadFileName}" uploaded successfully.`,
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
      expect(store.removePendingDoc).toHaveBeenCalled();
    });

    it("handles upload error", async () => {
      const file = new File(["content"], "test.pdf");
      const uploadFileName = "Test Document";
      const onSuccess = vi.fn();

      mockUploadMutation.mockRejectedValueOnce(new Error("Upload failed"));

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(file, uploadFileName, onSuccess);
      });

      // Verify error flow
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        `Failed to upload file "${uploadFileName}". Please try again.`,
      );
      expect(store.updatePendingDoc).toHaveBeenCalledWith(expect.any(String), {
        isUploading: false,
        uploadFailed: true,
      });
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does nothing if no file provided", async () => {
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(null, "filename", onSuccess);
      });

      expect(store.addPendingDoc).not.toHaveBeenCalled();
      expect(mockUploadMutation).not.toHaveBeenCalled();
    });

    it("does nothing if no filename provided", async () => {
      const file = new File(["content"], "test.pdf");
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUpload(file, "", onSuccess);
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
      };
      const onSuccess = vi.fn();

      mockUploadMutation.mockRejectedValueOnce(new Error("Upload failed"));

      const { result } = renderHook(() => useDocumentUpload());

      await act(async () => {
        await result.current.handleUploadRetry(pendingDoc, onSuccess);
      });

      // Verify error flow
      expect(notificationStore.addErrorNotification).toHaveBeenCalled();
      expect(store.updatePendingDoc).toHaveBeenCalledWith("pending-123", {
        isUploading: false,
        uploadFailed: true,
      });
    });
  });

  it("works with undefined recResource", async () => {
    // Mock useStore to return undefined recResource
    vi.mocked(useStore).mockReturnValue({
      recResource: undefined,
    });

    const file = new File(["content"], "test.pdf");
    const onSuccess = vi.fn();
    mockUploadMutation.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.handleUpload(file, "test", onSuccess);
    });

    expect(mockUploadMutation).toHaveBeenCalledWith({
      recResourceId: undefined,
      file,
      title: "test",
    });
  });
});

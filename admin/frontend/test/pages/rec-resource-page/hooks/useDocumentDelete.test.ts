import { useDocumentDelete } from "@/pages/rec-resource-page/hooks/useDocumentDelete";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { GalleryDocument } from "@/pages/rec-resource-page/types";
import { useDeleteResourceDocument } from "@/services/hooks/recreation-resource-admin/useDeleteResourceDocument";
import { RecreationResourceDetailDto } from "@/services/recreation-resource-admin";
import { handleApiError } from "@/services/utils/errorHandler";
import * as notificationStore from "@/store/notificationStore";
import { useStore } from "@tanstack/react-store";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn(),
}));

vi.mock(
  "@/services/hooks/recreation-resource-admin/useDeleteResourceDocument",
  () => ({
    useDeleteResourceDocument: vi.fn(),
  }),
);

vi.mock("@/pages/rec-resource-page/hooks/useRecResource", () => ({
  useRecResource: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {
    setState: vi.fn(),
    getState: vi.fn(),
    state: { galleryDocuments: [], fileToDelete: null },
  },
  updateGalleryDocument: vi.fn(),
  setSelectedFile: vi.fn(),
  setUploadFileName: vi.fn(),
  setShowUploadOverlay: vi.fn(),
  resetUploadState: vi.fn(),
  setShowDeleteModal: vi.fn(),
  setFileToDelete: vi.fn(),
  showDeleteModalForDoc: vi.fn(),
  hideDeleteModal: vi.fn(),
  addPendingDoc: vi.fn(),
  updatePendingDoc: vi.fn(),
  removePendingDoc: vi.fn(),
  setGalleryDocuments: vi.fn(),
}));

vi.mock("@/store/notificationStore", () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock("@/services/utils/errorHandler", () => ({
  handleApiError: vi.fn(),
}));

const mockDeleteMutation = vi.fn();
const mockRecResource = {
  rec_resource_id: "test-resource-123",
} as RecreationResourceDetailDto;
const mockDocument: GalleryDocument = {
  id: "test-doc-123",
  name: "test-document.pdf",
  date: "2025-01-01",
  url: "http://example.com/test.pdf",
  extension: "pdf",
  type: "document",
};

describe("useDocumentDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRecResource hook
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "test-resource-123",
      recResource: mockRecResource,
      isLoading: false,
      error: null,
    });

    // Mock useStore for recResourceFileTransferStore
    vi.mocked(useStore).mockReturnValue({ fileToDelete: mockDocument });

    // Mock delete mutation
    vi.mocked(useDeleteResourceDocument).mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: false,
    } as any);

    // Mock handleApiError to return expected error format
    vi.mocked(handleApiError).mockResolvedValue({
      statusCode: 500,
      message: "Delete failed",
      isResponseError: false,
      isAuthError: false,
    });
  });

  it("returns delete handlers and pending state", () => {
    const { result } = renderHook(() => useDocumentDelete());

    expect(result.current).toMatchObject({
      handleDelete: expect.any(Function),
      isDeleting: expect.any(Boolean),
    });
  });

  describe("handleDelete", () => {
    const mockDocument: GalleryDocument = {
      id: "test-doc-123",
      name: "test-document.pdf",
      date: "2025-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
      type: "document",
    };

    it("deletes document successfully", async () => {
      const onSuccess = vi.fn();
      mockDeleteMutation.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify document state was updated to deleting
      expect(store.updateGalleryDocument).toHaveBeenCalledWith(
        mockDocument.id,
        { isDeleting: true },
      );

      // Verify delete was called with correct params
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        refId: mockDocument.id,
      });

      // Verify success notification was shown
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        `Document "${mockDocument.name}" deleted successfully.`,
      );

      // Verify success callback was called
      expect(onSuccess).toHaveBeenCalled();

      // Verify no error notification
      expect(notificationStore.addErrorNotification).not.toHaveBeenCalled();
    });

    it("handles delete failure", async () => {
      const onSuccess = vi.fn();
      const deleteError = new Error("Delete failed");
      mockDeleteMutation.mockRejectedValueOnce(deleteError);

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify document state was updated to deleting
      expect(store.updateGalleryDocument).toHaveBeenCalledWith(
        mockDocument.id,
        { isDeleting: true },
      );

      // Verify delete was attempted
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        refId: mockDocument.id,
      });

      // Verify error notification was shown
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        `500 - Failed to delete document "${mockDocument.name}": Delete failed. Please try again.`,
      );

      // Verify success callback was not called
      expect(onSuccess).not.toHaveBeenCalled();

      // Verify no success notification
      expect(notificationStore.addSuccessNotification).not.toHaveBeenCalled();
    });

    it("handles missing rec resource ID", async () => {
      const onSuccess = vi.fn();

      // Mock useRecResource with no rec resource
      vi.mocked(useRecResource).mockReturnValue({
        rec_resource_id: "test-resource-123",
        recResource: undefined,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify error notification was shown
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        "Unable to delete document: missing required information.",
      );

      // Verify delete was not attempted
      expect(mockDeleteMutation).not.toHaveBeenCalled();

      // Verify success callback was not called
      expect(onSuccess).not.toHaveBeenCalled();

      // Verify document state was not updated
      expect(store.updateGalleryDocument).not.toHaveBeenCalled();
    });

    it("handles missing document ID", async () => {
      const onSuccess = vi.fn();
      const documentWithoutId: GalleryDocument = {
        ...mockDocument,
        id: "",
      };

      // Mock useStore to return document without ID
      vi.mocked(useStore).mockReturnValue({ fileToDelete: documentWithoutId });

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify error notification was shown
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        "Unable to delete document: missing required information.",
      );

      // Verify delete was not attempted
      expect(mockDeleteMutation).not.toHaveBeenCalled();

      // Verify success callback was not called
      expect(onSuccess).not.toHaveBeenCalled();

      // Verify document state was not updated
      expect(store.updateGalleryDocument).not.toHaveBeenCalled();
    });

    it("handles missing rec resource with undefined rec_resource_id", async () => {
      const onSuccess = vi.fn();

      // Mock useRecResource with rec resource but no ID
      vi.mocked(useRecResource).mockReturnValue({
        rec_resource_id: "test-resource-123",
        recResource: { ...mockRecResource, rec_resource_id: undefined as any },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify error notification was shown
      expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
        "Unable to delete document: missing required information.",
      );

      // Verify delete was not attempted
      expect(mockDeleteMutation).not.toHaveBeenCalled();

      // Verify success callback was not called
      expect(onSuccess).not.toHaveBeenCalled();

      // Verify document state was not updated
      expect(store.updateGalleryDocument).not.toHaveBeenCalled();
    });

    it("works without onSuccess callback", async () => {
      mockDeleteMutation.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useDocumentDelete());

      await act(async () => {
        await result.current.handleDelete();
      });

      // Verify delete was successful
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        refId: mockDocument.id,
      });

      // Verify success notification was shown
      expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
        `Document "${mockDocument.name}" deleted successfully.`,
      );
    });

    it("updates document state before attempting delete", async () => {
      const onSuccess = vi.fn();

      // Create a slow promise to test the order of operations
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockDeleteMutation.mockReturnValueOnce(slowPromise);

      const { result } = renderHook(() => useDocumentDelete());

      // Start the delete operation
      const deletePromise = act(async () => {
        await result.current.handleDelete(onSuccess);
      });

      // Verify document state was updated to deleting immediately
      expect(store.updateGalleryDocument).toHaveBeenCalledWith(
        mockDocument.id,
        { isDeleting: true },
      );

      // Resolve the mutation
      resolvePromise!({ success: true });
      await deletePromise;

      // Verify the mutation was called
      expect(mockDeleteMutation).toHaveBeenCalledWith({
        recResourceId: "test-resource-123",
        refId: mockDocument.id,
      });
    });
  });

  describe("isDeleting state", () => {
    it("returns isPending state from mutation", () => {
      vi.mocked(useDeleteResourceDocument).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: true,
      } as any);

      const { result } = renderHook(() => useDocumentDelete());

      expect(result.current.isDeleting).toBe(true);
    });

    it("returns false when mutation is not pending", () => {
      vi.mocked(useDeleteResourceDocument).mockReturnValue({
        mutateAsync: mockDeleteMutation,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useDocumentDelete());

      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe("dependency updates", () => {
    it("re-creates handleDelete when recResource changes", () => {
      const { result, rerender } = renderHook(() => useDocumentDelete());

      const initialHandleDelete = result.current.handleDelete;

      // Change the rec resource
      vi.mocked(useRecResource).mockReturnValue({
        rec_resource_id: "different-resource-456",
        recResource: {
          ...mockRecResource,
          rec_resource_id: "different-resource-456",
        },
        isLoading: false,
        error: null,
      });

      rerender();

      // The function should be different (new instance)
      expect(result.current.handleDelete).not.toBe(initialHandleDelete);
    });

    it("re-creates handleDelete when deleteResourceDocumentMutation changes", () => {
      const { result, rerender } = renderHook(() => useDocumentDelete());

      const initialHandleDelete = result.current.handleDelete;

      // Change the mutation
      const newMockDeleteMutation = vi.fn();
      vi.mocked(useDeleteResourceDocument).mockReturnValue({
        mutateAsync: newMockDeleteMutation,
        isPending: false,
      } as any);

      rerender();

      // The function should be different (new instance)
      expect(result.current.handleDelete).not.toBe(initialHandleDelete);
    });
  });
});

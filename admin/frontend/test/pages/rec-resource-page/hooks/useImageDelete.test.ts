import { useImageDelete } from "@/pages/rec-resource-page/hooks/useImageDelete";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import {
  recResourceFileTransferStore,
  updateGalleryImage,
} from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { GalleryImage } from "@/pages/rec-resource-page/types";
import { useDeleteResourceImage } from "@/services/hooks/recreation-resource-admin/useDeleteResourceImage";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/pages/rec-resource-page/hooks/useRecResource", () => ({
  useRecResource: vi.fn(),
}));

vi.mock(
  "@/services/hooks/recreation-resource-admin/useDeleteResourceImage",
  () => ({
    useDeleteResourceImage: vi.fn(),
  }),
);

vi.mock("@/store/notificationStore", () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

vi.mock("@/services/utils/errorHandler", () => ({
  handleApiError: vi.fn(),
}));

vi.mock(
  "@/pages/rec-resource-page/store/recResourceFileTransferStore",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/pages/rec-resource-page/store/recResourceFileTransferStore")
      >();
    return {
      ...actual,
      updateGalleryImage: vi.fn(),
    };
  },
);

const mockUseRecResource = vi.mocked(useRecResource);
const mockUseDeleteResourceImage = vi.mocked(useDeleteResourceImage);
const mockAddErrorNotification = vi.mocked(addErrorNotification);
const mockAddSuccessNotification = vi.mocked(addSuccessNotification);
const mockUpdateGalleryImage = vi.mocked(updateGalleryImage);
const mockHandleApiError = vi.mocked(handleApiError);

describe("useImageDelete", () => {
  const mockMutateAsync = vi.fn();
  const mockRecResource = {
    rec_resource_id: "test-resource-id",
  };
  const mockImage: GalleryImage = {
    id: "test-image-id",
    name: "test-image.jpg",
    date: "2024-01-01",
    url: "https://example.com/test-image.jpg",
    extension: "jpg",
    type: "image" as const,
    variants: [],
    previewUrl: "https://example.com/test-image-preview.jpg",
    pendingFile: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRecResource.mockReturnValue({
      recResource: mockRecResource,
    } as any);

    mockUseDeleteResourceImage.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    // Set up store state
    recResourceFileTransferStore.setState({
      selectedFileForUpload: null,
      uploadFileName: "",
      showUploadOverlay: false,
      pendingDocs: [],
      galleryDocuments: [],
      pendingImages: [],
      galleryImages: [],
      showDeleteModal: false,
      fileToDelete: mockImage,
    });
  });

  it("should handle successful image deletion", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useImageDelete());

    await result.current.handleDelete();

    await waitFor(() => {
      expect(mockUpdateGalleryImage).toHaveBeenCalledWith(mockImage.id, {
        isDeleting: true,
      });
      expect(mockMutateAsync).toHaveBeenCalledWith({
        recResourceId: mockRecResource.rec_resource_id,
        refId: mockImage.id,
      });
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        `Image "${mockImage.name}" deleted successfully.`,
      );
    });
  });

  it("should handle successful image deletion with onSuccess callback", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() => useImageDelete());

    await result.current.handleDelete(onSuccessMock);

    await waitFor(() => {
      expect(mockUpdateGalleryImage).toHaveBeenCalledWith(mockImage.id, {
        isDeleting: true,
      });
      expect(mockMutateAsync).toHaveBeenCalledWith({
        recResourceId: mockRecResource.rec_resource_id,
        refId: mockImage.id,
      });
      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        `Image "${mockImage.name}" deleted successfully.`,
      );
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it("should handle deletion error", async () => {
    const mockError = new Error("Deletion failed");
    mockMutateAsync.mockRejectedValue(mockError);

    // Mock handleApiError to return expected error format
    mockHandleApiError.mockResolvedValue({
      statusCode: 500,
      message: "Delete failed",
      isResponseError: false,
      isAuthError: false,
    });

    const { result } = renderHook(() => useImageDelete());

    await result.current.handleDelete();

    await waitFor(() => {
      expect(mockUpdateGalleryImage).toHaveBeenCalledWith(mockImage.id, {
        isDeleting: true,
      });
      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete image"),
      );
      expect(mockUpdateGalleryImage).toHaveBeenCalledWith(mockImage.id, {
        isDeleting: false,
        deleteFailed: true,
      });
    });
  });

  it("should not proceed if no resource id", async () => {
    mockUseRecResource.mockReturnValue({
      recResource: null,
    } as any);

    const { result } = renderHook(() => useImageDelete());

    await result.current.handleDelete();

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      "Unable to delete image: missing required information.",
    );
  });

  it("should not proceed if no image to delete", async () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      fileToDelete: undefined,
    }));

    const { result } = renderHook(() => useImageDelete());

    await result.current.handleDelete();

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      "Unable to delete image: missing required information.",
    );
  });

  it("should return correct loading state", () => {
    mockUseDeleteResourceImage.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    const { result } = renderHook(() => useImageDelete());

    expect(result.current.isDeleting).toBe(true);
  });
});

import { useImageUpload } from "@/pages/rec-resource-page/hooks/useImageUpload";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { useUploadResourceImage } from "@/services/hooks/recreation-resource-admin/useUploadResourceImage";
import { handleApiError } from "@/services/utils/errorHandler";
import {
  addErrorNotification,
  addSuccessNotification,
} from "@/store/notificationStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the dependencies
vi.mock("@/pages/rec-resource-page/hooks/useRecResource");
vi.mock("@/services/hooks/recreation-resource-admin/useUploadResourceImage");
vi.mock("@/services/utils/errorHandler");
vi.mock("@/store/notificationStore");
vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  addPendingImage: vi.fn(),
  removePendingImage: vi.fn(),
  updatePendingImage: vi.fn(),
}));

const mockUploadResourceImage = vi.fn();
const mockRecResource = {
  rec_resource_id: "test-rec-resource-id",
};

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

describe("useImageUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRecResource
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: "test-rec-resource-id",
      recResource: mockRecResource as any,
      isLoading: false,
      error: null,
    });

    // Mock useUploadResourceImage
    vi.mocked(useUploadResourceImage).mockReturnValue({
      mutateAsync: mockUploadResourceImage,
    } as any);

    vi.mocked(addSuccessNotification).mockImplementation(() => {});
    vi.mocked(addErrorNotification).mockImplementation(() => {});
  });

  it("should handle successful image upload", async () => {
    mockUploadResourceImage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const galleryFile = {
      id: "temp-id",
      name: "Test Image",
      date: "2024-01-01",
      url: "",
      extension: "jpg",
      pendingFile: mockFile,
      type: "image" as const,
    };
    const onSuccess = vi.fn();

    await result.current.handleUpload(galleryFile, onSuccess);

    await waitFor(() => {
      expect(mockUploadResourceImage).toHaveBeenCalledWith({
        recResourceId: "test-rec-resource-id",
        file: mockFile,
        caption: "Test Image",
      });
    });

    expect(addSuccessNotification).toHaveBeenCalledWith(
      `Image "Test Image" uploaded successfully.`,
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle failed image upload", async () => {
    const mockError = new Error("Upload failed");
    mockUploadResourceImage.mockRejectedValueOnce(mockError);

    vi.mocked(handleApiError).mockResolvedValueOnce({
      statusCode: 500,
      message: "Internal server error",
      isResponseError: true,
      isAuthError: false,
    });

    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const galleryFile = {
      id: "temp-id",
      name: "Test Image",
      date: "2024-01-01",
      url: "",
      extension: "jpg",
      pendingFile: mockFile,
      type: "image" as const,
    };

    await result.current.handleUpload(galleryFile);

    await waitFor(() => {
      expect(addErrorNotification).toHaveBeenCalledWith(
        `500 - Failed to upload image "Test Image": Internal server error. Please try again.`,
      );
    });
  });

  it("should handle upload retry for failed images", async () => {
    mockUploadResourceImage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const pendingImage = {
      id: "pending-123",
      name: "Test Image",
      pendingFile: mockFile,
    };
    const onSuccess = vi.fn();

    await result.current.handleUploadRetry(pendingImage as any, onSuccess);

    await waitFor(() => {
      expect(mockUploadResourceImage).toHaveBeenCalledWith({
        recResourceId: "test-rec-resource-id",
        file: mockFile,
        caption: "Test Image",
      });
    });

    expect(addSuccessNotification).toHaveBeenCalledWith(
      `Image "Test Image" uploaded successfully.`,
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should not upload if required parameters are missing", async () => {
    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    // Test with null pendingFile
    const galleryFileWithoutFile = {
      id: "temp-id",
      name: "Test Image",
      date: "2024-01-01",
      url: "",
      extension: "jpg",
      pendingFile: undefined,
      type: "image" as const,
    };
    await result.current.handleUpload(galleryFileWithoutFile);
    expect(mockUploadResourceImage).not.toHaveBeenCalled();

    // Test with empty filename
    const mockFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const galleryFileWithoutName = {
      id: "temp-id",
      name: "",
      date: "2024-01-01",
      url: "",
      extension: "jpg",
      pendingFile: mockFile,
      type: "image" as const,
    };
    await result.current.handleUpload(galleryFileWithoutName);
    expect(mockUploadResourceImage).not.toHaveBeenCalled();
  });

  it("should not retry upload if resource id is missing", async () => {
    // Mock useRecResource to return null rec_resource_id
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: null,
      recResource: null,
      isLoading: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });
    const pendingImage = {
      id: "pending-123",
      name: "Test Image",
      pendingFile: mockFile,
    };
    const onSuccess = vi.fn();

    await result.current.handleUploadRetry(pendingImage as any, onSuccess);

    expect(mockUploadResourceImage).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should not retry upload if pendingFile is missing", async () => {
    const { result } = renderHook(() => useImageUpload(), {
      wrapper: createWrapper(),
    });

    const pendingImageWithoutFile = {
      id: "pending-123",
      name: "Test Image",
      pendingFile: undefined,
    };
    const onSuccess = vi.fn();

    await result.current.handleUploadRetry(
      pendingImageWithoutFile as any,
      onSuccess,
    );

    expect(mockUploadResourceImage).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

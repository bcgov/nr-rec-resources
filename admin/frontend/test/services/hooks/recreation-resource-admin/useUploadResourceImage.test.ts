import { Mock, vi } from "vitest";
import { createRetryHandler } from "@/services/recreation-resource-admin/hooks/helpers";
import { useRecreationResourceAdminApiClient } from "@/services/recreation-resource-admin";
import { useUploadResourceImage } from "@/services/recreation-resource-admin";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { renderHook } from "@testing-library/react";

// Mock dependencies first - this needs to be before imports
vi.mock(
  "@/services/recreation-resource-admin/hooks/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock("@/services/recreation-resource-admin/hooks/helpers", () => ({
  createRetryHandler: vi.fn(),
}));

describe("useUploadResourceImage", () => {
  const mockApi = {
    createRecreationresourceImage: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it("should return a mutation function", () => {
    const { result } = renderHook(() => useUploadResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(result.current).toHaveProperty("mutateAsync");
    expect(result.current).toHaveProperty("isPending");
  });

  it("should configure retry with createRetryHandler", () => {
    renderHook(() => useUploadResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it("should use the API client for upload", () => {
    renderHook(() => useUploadResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it("should call createRecreationresourceImage with correct parameters", async () => {
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const mockParams = {
      recResourceId: "test-resource-id",
      file: mockFile,
      caption: "test caption",
    };

    mockApi.createRecreationresourceImage.mockResolvedValue({
      id: "test-image-id",
    });

    const { result } = renderHook(() => useUploadResourceImage(), {
      wrapper: reactQueryWrapper,
    });

    await result.current.mutateAsync(mockParams);

    expect(mockApi.createRecreationresourceImage).toHaveBeenCalledWith({
      recResourceId: mockParams.recResourceId,
      caption: mockParams.caption,
      file: mockParams.file,
    });
  });
});

import * as HelpersModule from "@/services/recreation-resource-admin/hooks/helpers";
import { useGetRecreationResourceById } from "@/services/recreation-resource-admin";
import * as ApiClientModule from "@/services/recreation-resource-admin";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { renderHook, waitFor } from "@testing-library/react";
import { Mock, vi } from "vitest";

// Mock the API client hook and the API itself
vi.mock(
  "@/services/recreation-resource-admin/hooks/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

// Mock the helper functions
vi.mock("@/services/recreation-resource-admin/hooks/helpers", () => ({
  createRetryHandler: vi.fn(),
}));

describe("useGetRecreationResourceById", () => {
  const mockGetRecreationResourceById = vi.fn();
  const mockApi = { getRecreationResourceById: mockGetRecreationResourceById };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    // Mock createRetryHandler to return a simple retry function
    createRetryHandler.mockReturnValue(() => false); // No retries for simplicity in tests
  });

  it("should not run query if no id is provided", () => {
    const { result } = renderHook(
      () => useGetRecreationResourceById(undefined),
      { wrapper: reactQueryWrapper },
    );
    expect(result.current.status).toBe("pending");
    expect(mockGetRecreationResourceById).not.toHaveBeenCalled();
  });

  it("should call api.getRecreationResourceById with correct id", async () => {
    mockGetRecreationResourceById.mockResolvedValueOnce({
      id: "123",
      name: "Test Resource",
    });
    const { result } = renderHook(() => useGetRecreationResourceById("123"), {
      wrapper: reactQueryWrapper,
    });
    await waitFor(() =>
      expect(result.current.data).toEqual({ id: "123", name: "Test Resource" }),
    );
    expect(mockGetRecreationResourceById).toHaveBeenCalledWith({
      recResourceId: "123",
    });
  });

  it("should use createRetryHandler for retry logic", () => {
    renderHook(() => useGetRecreationResourceById("123"), {
      wrapper: reactQueryWrapper,
    });
    expect(createRetryHandler).toHaveBeenCalledWith();
  });
});

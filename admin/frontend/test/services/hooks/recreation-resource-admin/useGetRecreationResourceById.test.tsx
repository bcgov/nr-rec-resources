import { renderHook, waitFor } from "@testing-library/react";
import { useGetRecreationResourceById } from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceById";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";
import { vi, Mock } from "vitest";
import * as ApiClientModule from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";

// Mock the API client hook and the API itself
vi.mock(
  "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

describe("useGetRecreationResourceById", () => {
  const mockGetRecreationResourceById = vi.fn();
  const mockApi = { getRecreationResourceById: mockGetRecreationResourceById };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
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
});

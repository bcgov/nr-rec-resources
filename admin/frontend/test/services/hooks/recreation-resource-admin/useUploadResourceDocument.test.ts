import { describe, it, beforeEach, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUploadResourceDocument } from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import { RecreationResourceApi } from "@/services/recreation-resource-admin/apis/RecreationResourceApi";
import * as apiClientModule from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { reactQueryWrapper } from "@test/test-utils/reactQueryWrapper";

vi.mock(
  "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

const mockCreateRecreationresourceDocument = vi.fn();

const mockApi: Partial<RecreationResourceApi> = {
  createRecreationresourceDocument: mockCreateRecreationresourceDocument,
};

describe("useUploadResourceDocument (vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      apiClientModule.useRecreationResourceAdminApiClient as any
    ).mockReturnValue(mockApi);
  });

  it("calls createRecreationresourceDocument with correct params", async () => {
    const params = {
      recResourceId: "123",
      file: new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      }),
      title: "Test PDF",
    };
    mockCreateRecreationresourceDocument.mockResolvedValueOnce({
      success: true,
    });

    const { result } = renderHook(() => useUploadResourceDocument(), {
      wrapper: reactQueryWrapper,
    });

    await act(async () => {
      result.current.mutate(params);
    });

    expect(mockCreateRecreationresourceDocument).toHaveBeenCalledWith(params);
  });
});

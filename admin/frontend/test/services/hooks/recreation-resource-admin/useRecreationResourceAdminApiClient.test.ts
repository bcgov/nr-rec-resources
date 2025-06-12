import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRecreationResourceAdminApiClient } from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";
import { RecreationResourceApi } from "@/services/recreation-resource-admin";

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

describe("useRecreationResourceAdminApiClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "https://example.com/api");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("should return a RecreationResourceApi instance with proper configuration", async () => {
    const mockGetToken = vi.fn().mockResolvedValue("mock-token");

    const { useAuthContext } = await import("@/contexts/AuthContext");
    (useAuthContext as Mock).mockReturnValue({
      authService: {
        getToken: mockGetToken,
      },
    });

    const { result } = renderHook(() => useRecreationResourceAdminApiClient());

    expect(result.current).toBeInstanceOf(RecreationResourceApi);

    // Check if the config object has the correct basePath
    const config = result.current["configuration"];
    expect(config.basePath).toBe("https://example.com");

    // Check that accessToken returns the mocked token
    const token = await config.accessToken?.();
    expect(token).toBe("mock-token");
    expect(mockGetToken).toHaveBeenCalled();
  });

  it("should fallback to empty basePath if VITE_API_BASE_URL is not set", async () => {
    vi.stubEnv("VITE_API_BASE_URL", undefined);

    const mockGetToken = vi.fn().mockResolvedValue("another-token");
    const { useAuthContext } = await import("@/contexts/AuthContext");
    (useAuthContext as Mock).mockReturnValue({
      authService: {
        getToken: mockGetToken,
      },
    });

    const { result } = renderHook(() => useRecreationResourceAdminApiClient());

    const config = result.current["configuration"];
    expect(config.basePath).toBe(""); // fallback path
    const token = await config.accessToken?.();
    expect(token).toBe("another-token");
  });
});

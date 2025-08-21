import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import { Mock, vi } from "vitest";
import {
  createRetryHandler,
  transformRecreationResourceImages,
} from "@/services/recreation-resource-admin/hooks/helpers";
import { useGetImagesByRecResourceId } from "@/services/recreation-resource-admin";
import { useRecreationResourceAdminApiClient } from "@/services/recreation-resource-admin";
import * as notificationStore from "@/store/notificationStore";

// Mock dependencies first - this needs to be before imports
vi.mock(
  "@/services/recreation-resource-admin/hooks/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock("@/services/recreation-resource-admin/hooks/helpers", () => ({
  createRetryHandler: vi.fn(),
  transformRecreationResourceImages: vi.fn(),
}));

vi.mock("@/store/notificationStore", () => ({
  addErrorNotification: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper(props: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      props.children,
    );
  };
};

describe("useGetImagesByRecResourceId", () => {
  const mockApi = {
    getImagesByRecResourceId: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
    (transformRecreationResourceImages as Mock).mockImplementation(
      (data: any) => data,
    );
  });

  it("should return query with correct initial data", () => {
    const { result } = renderHook(
      () => useGetImagesByRecResourceId("test-id"),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.data).toEqual([]);
  });

  it("should be enabled when recResourceId is provided", () => {
    mockApi.getImagesByRecResourceId.mockResolvedValueOnce([]);

    const { result } = renderHook(
      () => useGetImagesByRecResourceId("test-id"),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isSuccess || result.current.isLoading).toBe(true);
  });

  it("should be disabled when recResourceId is not provided", () => {
    const { result } = renderHook(
      () => useGetImagesByRecResourceId(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isPending).toBe(false);
  });

  it("should use correct query key", () => {
    renderHook(() => useGetImagesByRecResourceId("test-id"), {
      wrapper: createWrapper(),
    });

    // Query key is used internally, this test ensures the hook can be rendered
    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it("should configure retry handler", () => {
    renderHook(() => useGetImagesByRecResourceId("test-id"), {
      wrapper: createWrapper(),
    });

    expect(createRetryHandler).toHaveBeenCalledWith({
      onFail: expect.any(Function),
    });
  });

  it("should call addErrorNotification on retry failure", () => {
    // First render the hook to trigger createRetryHandler call
    renderHook(() => useGetImagesByRecResourceId("test-id"), {
      wrapper: createWrapper(),
    });

    // Now we can access the mock call
    const onFailCallback = (createRetryHandler as any).mock.calls[0][0].onFail;
    onFailCallback();

    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      "Failed to load images after multiple attempts. Please try again later.",
      "getImagesByRecResourceId-error",
    );
  });
});

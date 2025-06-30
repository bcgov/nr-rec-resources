import { renderHook } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { useGlobalQueryErrorHandler } from "@/services/hooks/useGlobalQueryErrorHandler";
import { ResponseError } from "@/services/recreation-resource-admin";
import * as notificationStore from "@/store/notificationStore";
import { vi } from "vitest";

function createMockResponse(status: number): Response {
  return {
    status,
    headers: new Headers(),
    ok: status >= 200 && status < 300,
    redirected: false,
    statusText: String(status),
    type: "basic",
    url: "",
    body: null,
    bodyUsed: false,
    clone: () => ({}) as Response,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    json: async () => ({}),
    text: async () => "",
  } as Response;
}

describe("useGlobalQueryErrorHandler", () => {
  let queryClient: QueryClient;
  let addErrorNotificationSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = new QueryClient();
    addErrorNotificationSpy = vi.spyOn(
      notificationStore,
      "addErrorNotification",
    );
  });

  afterEach(() => {
    addErrorNotificationSpy.mockRestore();
  });

  it("should add error notification for 401 ResponseError", () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));
    const error = new ResponseError(createMockResponse(401), "Unauthorized");
    const event = {
      query: {
        state: {
          status: "error",
          fetchStatus: "idle",
          error,
        },
        queryKey: ["test-key"],
      },
    };
    queryClient.getQueryCache().notify(event as any);
    expect(addErrorNotificationSpy).toHaveBeenCalledWith(
      expect.stringContaining("401"),
      expect.stringContaining("401-error"),
    );
  });

  it("should add error notification for 403 ResponseError", () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));
    const error = new ResponseError(createMockResponse(403), "Forbidden");
    const event = {
      query: {
        state: {
          status: "error",
          fetchStatus: "idle",
          error,
        },
        queryKey: ["test-key"],
      },
    };
    queryClient.getQueryCache().notify(event as any);
    expect(addErrorNotificationSpy).toHaveBeenCalledWith(
      expect.stringContaining("403"),
      expect.stringContaining("403-error"),
    );
  });

  it("should not add notification for non-401/403 errors", () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));
    const error = new ResponseError(createMockResponse(500), "Server Error");
    const event = {
      query: {
        state: {
          status: "error",
          fetchStatus: "idle",
          error,
        },
        queryKey: ["test-key"],
      },
    };
    queryClient.getQueryCache().notify(event as any);
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should not add notification for non-ResponseError errors", () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));
    const event = {
      query: {
        state: {
          status: "error",
          fetchStatus: "idle",
          error: new Error("Some error"),
        },
        queryKey: ["test-key"],
      },
    };
    queryClient.getQueryCache().notify(event as any);
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });
});

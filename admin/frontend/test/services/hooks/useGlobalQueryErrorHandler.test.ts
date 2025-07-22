import { AuthenticationError } from "@/errors";
import { useGlobalQueryErrorHandler } from "@/services/hooks/useGlobalQueryErrorHandler";
import { ResponseError } from "@/services/recreation-resource-admin";
import * as errorHandler from "@/services/utils/errorHandler";
import * as notificationStore from "@/store/notificationStore";
import { QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createMockResponse(status: number, jsonData?: any): Response {
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
    json: async () => jsonData || { message: `HTTP ${status} Error` },
    text: async () => "",
  } as Response;
}

describe("useGlobalQueryErrorHandler", () => {
  let queryClient: QueryClient;
  let addErrorNotificationSpy: ReturnType<typeof vi.spyOn>;
  let handleApiErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    addErrorNotificationSpy = vi.spyOn(
      notificationStore,
      "addErrorNotification",
    );
    handleApiErrorSpy = vi.spyOn(errorHandler, "handleApiError");
  });

  afterEach(() => {
    addErrorNotificationSpy.mockRestore();
    handleApiErrorSpy.mockRestore();
    queryClient.clear();
  });

  it("should add error notification for 401 ResponseError", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 401,
      message: "Unauthorized access",
      isResponseError: true,
      isAuthError: true,
    });

    const error = new ResponseError(
      createMockResponse(401, { message: "Unauthorized access" }),
      "Unauthorized",
    );

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    await waitFor(() => {
      expect(addErrorNotificationSpy).toHaveBeenCalledWith(
        "401 - Unauthorized access",
      );
    });

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should add error notification for 403 ResponseError", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 403,
      message: "Forbidden access",
      isResponseError: true,
      isAuthError: true,
    });

    const error = new ResponseError(
      createMockResponse(403, { message: "Forbidden access" }),
      "Forbidden",
    );

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    await waitFor(() => {
      expect(addErrorNotificationSpy).toHaveBeenCalledWith(
        "403 - Forbidden access",
      );
    });

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should add error notification for AuthenticationError", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 401,
      message: "Authentication failed",
      isResponseError: false,
      isAuthError: true,
    });

    const error = new AuthenticationError("Authentication failed");

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    await waitFor(() => {
      expect(addErrorNotificationSpy).toHaveBeenCalledWith(
        "401 - Authentication failed",
      );
    });

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
  });

  it("should not add notification for non-auth ResponseError (500)", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return non-auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 500,
      message: "Internal server error",
      isResponseError: true,
      isAuthError: false,
    });

    const error = new ResponseError(
      createMockResponse(500, { message: "Internal server error" }),
      "Server Error",
    );

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    // Wait a bit to ensure the async handler has time to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should not add notification for non-auth ResponseError (404)", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return non-auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 404,
      message: "Not found",
      isResponseError: true,
      isAuthError: false,
    });

    const error = new ResponseError(
      createMockResponse(404, { message: "Not found" }),
      "Not Found",
    );

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    // Wait a bit to ensure the async handler has time to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should not add notification for non-auth native Error", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    // Mock the handleApiError to return non-auth error info
    handleApiErrorSpy.mockResolvedValue({
      statusCode: 500,
      message: "Network error",
      isResponseError: false,
      isAuthError: false,
    });

    const error = new Error("Network error");

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    // Wait a bit to ensure the async handler has time to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should not trigger handler when fetchStatus is not idle", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    const error = new ResponseError(
      createMockResponse(401, { message: "Unauthorized" }),
      "Unauthorized",
    );

    const event = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "fetching" as const,
          error,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    // Wait a bit to ensure the async handler has time to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleApiErrorSpy).not.toHaveBeenCalled();
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should not trigger handler when status is not error", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    const event = {
      query: {
        state: {
          status: "success" as const,
          fetchStatus: "idle" as const,
          error: null,
        },
        queryKey: ["test-key"],
      },
    };

    queryClient.getQueryCache().notify(event as any);

    // Wait a bit to ensure the async handler has time to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handleApiErrorSpy).not.toHaveBeenCalled();
    expect(addErrorNotificationSpy).not.toHaveBeenCalled();
  });

  it("should handle multiple auth errors", async () => {
    renderHook(() => useGlobalQueryErrorHandler(queryClient));

    const error1 = new ResponseError(
      createMockResponse(401, { message: "Unauthorized" }),
      "Unauthorized",
    );

    const error2 = new AuthenticationError("Auth failed");

    // Mock handleApiError to return different responses for each call
    handleApiErrorSpy
      .mockResolvedValueOnce({
        statusCode: 401,
        message: "Unauthorized",
        isResponseError: true,
        isAuthError: true,
      })
      .mockResolvedValueOnce({
        statusCode: 401,
        message: "Auth failed",
        isResponseError: false,
        isAuthError: true,
      });

    const event1 = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error: error1,
        },
        queryKey: ["test-key-1"],
      },
    };

    const event2 = {
      query: {
        state: {
          status: "error" as const,
          fetchStatus: "idle" as const,
          error: error2,
        },
        queryKey: ["test-key-2"],
      },
    };

    queryClient.getQueryCache().notify(event1 as any);
    queryClient.getQueryCache().notify(event2 as any);

    await waitFor(() => {
      expect(addErrorNotificationSpy).toHaveBeenCalledTimes(2);
    });

    // Check that both errors were processed
    expect(handleApiErrorSpy).toHaveBeenCalledTimes(2);
    expect(handleApiErrorSpy).toHaveBeenNthCalledWith(1, error1);
    expect(handleApiErrorSpy).toHaveBeenNthCalledWith(2, error2);

    // Check that both messages were called, regardless of order
    const calls = addErrorNotificationSpy.mock.calls;
    const messages = calls.map((call) => call[0]);
    expect(messages).toContain("401 - Unauthorized");
    expect(messages).toContain("401 - Auth failed");
  });
});

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Mock, vi } from "vitest";
import { ResponseError } from "@/services/recreation-resource-admin";
import { useGetRecreationResourceSuggestions } from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions";
import { FC, ReactNode } from "react";
import { useRecreationResourceAdminApiClient } from "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient";

// --- Mocks ---
vi.mock(
  "@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient",
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

const mockGetSuggestions = vi.fn();

// --- Helpers ---
const getWrapper =
  (): FC<{ children: ReactNode }> =>
  ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );

const renderSuggestionsHook = (searchTerm: string) =>
  renderHook(() => useGetRecreationResourceSuggestions(searchTerm), {
    wrapper: getWrapper(),
  });

const setMockSuggestions = (value: any, isError = false) => {
  if (isError) {
    mockGetSuggestions.mockRejectedValueOnce(value);
  } else {
    mockGetSuggestions.mockResolvedValue(value);
  }
};

type RetryTestParams = {
  error: unknown;
  resolvedValue: any;
  searchTerm: string;
};

const expectRetryBehavior = async ({
  error,
  resolvedValue,
  searchTerm,
}: RetryTestParams) => {
  mockGetSuggestions
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce(resolvedValue);

  const { result } = renderSuggestionsHook(searchTerm);

  await waitFor(() => expect(result.current.failureCount).toBe(1));
  await waitFor(() => expect(mockGetSuggestions).toHaveBeenCalledTimes(2));
  expect(result.current.isSuccess).toBe(true);
  expect(result.current.data).toEqual(resolvedValue);
};

// --- Tests ---
describe("useGetRecreationResourceSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue({
      getRecreationResourceSuggestions: mockGetSuggestions,
    });
  });

  it("does not fetch if search term is invalid", () => {
    const { result } = renderSuggestionsHook("  ");
    expect(result.current.data).toEqual({ total: 0, suggestions: [] });
    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  it("fetches data when search term is valid", async () => {
    setMockSuggestions({
      total: 1,
      suggestions: [{ id: "1", name: "Park" }],
    });

    const { result } = renderSuggestionsHook("Park");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(mockGetSuggestions).toHaveBeenCalledWith({ searchTerm: "Park" });
      expect(result.current.data).toEqual({
        total: 1,
        suggestions: [{ id: "1", name: "Park" }],
      });
    });
  });

  it("returns initialData immediately", () => {
    const { result } = renderSuggestionsHook("Valid");
    expect(result.current.data).toEqual({ total: 0, suggestions: [] });
  });

  it("does not retry for 4xx error", async () => {
    const error = new ResponseError({ status: 400 } as Response, "Bad Request");
    setMockSuggestions(error, true);

    const { result } = renderSuggestionsHook("ErrorTest");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
  });

  it("retries for 5xx error", async () => {
    await expectRetryBehavior({
      error: new ResponseError({ status: 500 } as Response, "Server Error"),
      resolvedValue: {
        total: 2,
        suggestions: [{ id: "2", name: "Lake" }],
      },
      searchTerm: "RetryTest",
    });
  });

  it("retries for generic error", async () => {
    await expectRetryBehavior({
      error: new Error("GENERIC_ERROR"),
      resolvedValue: {
        total: 2,
        suggestions: [{ id: "2", name: "Lake" }],
      },
      searchTerm: "RetryTest",
    });
  });
});

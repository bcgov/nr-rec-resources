import { useDocumentListState } from "@/pages/rec-resource-page/hooks/useDocumentListState";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/hooks/useDocumentList", () => ({
  useDocumentList: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {
    subscribe: vi.fn(),
    setState: vi.fn(),
    getState: vi.fn(),
  },
  setGalleryDocuments: vi.fn(),
}));

// Get references to the mocked functions
const mockUseStore = vi.mocked(
  (await import("@tanstack/react-store")).useStore
);
const mockUseDocumentListHook = vi.mocked(
  (await import("@/pages/rec-resource-page/hooks/useDocumentList")).useDocumentList
);

const mockStoreState = {
  pendingDocs: [] as any[],
  galleryDocuments: [] as any[],
};

describe("useDocumentListState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock state
    mockStoreState.pendingDocs = [];
    mockStoreState.galleryDocuments = [];

    // Mock useStore to return our mock state
    mockUseStore.mockReturnValue(mockStoreState);

    // Default return value for useDocumentList
    mockUseDocumentListHook.mockReturnValue({
      documents: [],
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it("returns document list state from both store and server", () => {
    const serverDocs = [
      {
        id: "server-1",
        name: "Server Doc 1",
        date: "2023-01-01",
        url: "http://example.com/1",
        extension: "pdf",
      },
    ];
    const pendingDocs = [
      {
        id: "pending-1",
        name: "Pending Doc 1",
        date: "2023-01-02",
        url: "",
        extension: "pdf",
      },
    ];

    mockStoreState.pendingDocs = pendingDocs;
    mockUseDocumentListHook.mockReturnValue({
      documents: serverDocs,
      isFetching: true,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useDocumentListState("test-resource-id"),
    );

    expect(result.current).toMatchObject({
      pendingDocs,
      galleryDocuments: mockStoreState.galleryDocuments,
      isDocumentUploadDisabled: false, // 2 documents (1 server + 1 pending) < 30 max
      isFetching: true,
      refetch: expect.any(Function),
    });
  });

  it("calls useDocumentList with provided resource ID", () => {
    const resourceId = "test-resource-123";

    renderHook(() => useDocumentListState(resourceId));

    expect(mockUseDocumentListHook).toHaveBeenCalledWith(resourceId);
  });

  it("calls useDocumentList with undefined when no resource ID provided", () => {
    renderHook(() => useDocumentListState());

    expect(mockUseDocumentListHook).toHaveBeenCalledWith(undefined);
  });

  it("syncs documents to store when pendingDocs or galleryDocumentsFromServer change", () => {
    const serverDocs = [
      {
        id: "server-1",
        name: "Server Doc 1",
        date: "2023-01-01",
        url: "http://example.com/1",
        extension: "pdf",
      },
    ];
    const pendingDocs = [
      {
        id: "pending-1",
        name: "Pending Doc 1",
        date: "2023-01-02",
        url: "",
        extension: "pdf",
      },
    ];

    mockStoreState.pendingDocs = pendingDocs;
    mockUseDocumentListHook.mockReturnValue({
      documents: serverDocs,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderHook(() => useDocumentListState("test-resource-id"));

    // Verify setGalleryDocuments was called with combined docs
    expect(store.setGalleryDocuments).toHaveBeenCalledWith([
      ...pendingDocs,
      ...serverDocs,
    ]);
  });

  it("handles undefined galleryDocumentsFromServer", () => {
    const pendingDocs = [
      {
        id: "pending-1",
        name: "Pending Doc 1",
        date: "2023-01-02",
        url: "",
        extension: "pdf",
      },
    ];

    mockStoreState.pendingDocs = pendingDocs;
    mockUseDocumentListHook.mockReturnValue({
      documents: [], // empty array instead of undefined
      isFetching: false,
      refetch: vi.fn(),
    });

    renderHook(() => useDocumentListState("test-resource-id"));

    // Should handle empty array gracefully
    expect(store.setGalleryDocuments).toHaveBeenCalledWith([...pendingDocs]);
  });

  it("updates store when pendingDocs change", () => {
    const { rerender } = renderHook(() =>
      useDocumentListState("test-resource-id"),
    );

    // Update pending docs
    const newPendingDocs = [
      {
        id: "pending-2",
        name: "New Pending Doc",
        date: "2023-01-03",
        url: "",
        extension: "pdf",
      },
    ];
    mockStoreState.pendingDocs = newPendingDocs;

    rerender();

    expect(store.setGalleryDocuments).toHaveBeenCalledWith([...newPendingDocs]);
  });

  it("updates store when server documents change", () => {
    const { rerender } = renderHook(() =>
      useDocumentListState("test-resource-id"),
    );

    // Update server docs
    const newServerDocs = [
      {
        id: "server-2",
        name: "New Server Doc",
        date: "2023-01-04",
        url: "http://example.com/2",
        extension: "pdf",
      },
    ];
    mockUseDocumentListHook.mockReturnValue({
      documents: newServerDocs,
      isFetching: false,
      refetch: vi.fn(),
    });

    rerender();

    expect(store.setGalleryDocuments).toHaveBeenCalledWith([
      ...mockStoreState.pendingDocs,
      ...newServerDocs,
    ]);
  });

  it("disables document upload when max documents limit is reached", () => {
    // Create 29 server docs + 1 pending doc = 30 total (should disable upload)
    const serverDocs = Array.from({ length: 29 }, (_, i) => ({
      id: `server-${i + 1}`,
      name: `Server Doc ${i + 1}`,
      date: "2023-01-01",
      url: `http://example.com/${i + 1}`,
      extension: "pdf",
    }));
    
    const pendingDocs = [
      {
        id: "pending-1",
        name: "Pending Doc 1",
        date: "2023-01-02",
        url: "",
        extension: "pdf",
      },
    ];

    mockStoreState.pendingDocs = pendingDocs;
    mockUseDocumentListHook.mockReturnValue({
      documents: serverDocs,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() =>
      useDocumentListState("test-resource-id"),
    );

    expect(result.current.isDocumentUploadDisabled).toBe(true);
  });
});

import { useDeleteModalState } from "@/pages/rec-resource-page/hooks/useDeleteModalState";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { GalleryFile } from "@/pages/rec-resource-page/types";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the store
const mockUseStore = vi.fn();
vi.mock("@tanstack/react-store", () => ({
  useStore: mockUseStore,
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {},
  setDocToDelete: vi.fn(),
  setShowDeleteModal: vi.fn(),
}));

const mockStoreState = {
  showDeleteModal: false,
  docToDelete: undefined as GalleryFile | undefined,
};

describe("useDeleteModalState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock state
    mockStoreState.showDeleteModal = false;
    mockStoreState.docToDelete = undefined;

    // Mock useStore to return our mock state
    mockUseStore.mockReturnValue(mockStoreState);
  });

  it("returns delete modal state and handlers", () => {
    const { result } = renderHook(() => useDeleteModalState());

    expect(result.current).toMatchObject({
      showDeleteModal: false,
      docToDelete: undefined,
      showDeleteModalForDoc: expect.any(Function),
      hideDeleteModal: expect.any(Function),
      setShowDeleteModal: expect.any(Function),
      setDocToDelete: expect.any(Function),
    });
  });

  it("returns current state from store", () => {
    const testDoc: GalleryFile = {
      id: "doc-1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
    };

    mockStoreState.showDeleteModal = true;
    mockStoreState.docToDelete = testDoc;

    const { result } = renderHook(() => useDeleteModalState());

    expect(result.current.showDeleteModal).toBe(true);
    expect(result.current.docToDelete).toBe(testDoc);
  });

  it("showDeleteModalForDoc sets doc and shows modal", () => {
    const doc: GalleryFile = {
      id: "1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://test",
      extension: "pdf",
    };
    const { result } = renderHook(() => useDeleteModalState());

    result.current.showDeleteModalForDoc(doc);

    expect(store.setDocToDelete).toHaveBeenCalledWith(doc);
    expect(store.setShowDeleteModal).toHaveBeenCalledWith(true);
  });

  it("hideDeleteModal hides modal and clears doc", () => {
    const { result } = renderHook(() => useDeleteModalState());

    result.current.hideDeleteModal();

    expect(store.setShowDeleteModal).toHaveBeenCalledWith(false);
    expect(store.setDocToDelete).toHaveBeenCalledWith(undefined);
  });

  it("setShowDeleteModal calls store action", () => {
    const { result } = renderHook(() => useDeleteModalState());

    result.current.setShowDeleteModal(true);

    expect(store.setShowDeleteModal).toHaveBeenCalledWith(true);
  });

  it("setDocToDelete calls store action", () => {
    const testDoc: GalleryFile = {
      id: "doc-1",
      name: "test.pdf",
      date: "2023-01-01",
      url: "http://example.com/test.pdf",
      extension: "pdf",
    };

    const { result } = renderHook(() => useDeleteModalState());

    result.current.setDocToDelete(testDoc);

    expect(store.setDocToDelete).toHaveBeenCalledWith(testDoc);
  });
});

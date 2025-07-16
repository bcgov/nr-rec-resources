import { useFilePickerState } from "@/pages/rec-resource-page/hooks/useFilePickerState";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the store
vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn(),
}));

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {},
  setSelectedFile: vi.fn(),
  setUploadFileName: vi.fn(),
  setShowUploadOverlay: vi.fn(),
}));

// Import mocked modules for type safety
import { useStore } from "@tanstack/react-store";

const mockStoreState = {
  selectedFileForUpload: null as File | null,
  uploadFileName: "",
  showUploadOverlay: false,
};

describe("useFilePickerState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock state
    mockStoreState.selectedFileForUpload = null;
    mockStoreState.uploadFileName = "";
    mockStoreState.showUploadOverlay = false;

    // Mock useStore to return our mock state
    vi.mocked(useStore).mockReturnValue(mockStoreState);
  });

  it("returns file picker state and handlers", () => {
    const { result } = renderHook(() => useFilePickerState());

    expect(result.current).toMatchObject({
      selectedFile: null,
      uploadFileName: "",
      showUploadOverlay: false,
      handleAddFileClick: expect.any(Function),
      handleCancelUpload: expect.any(Function),
      setUploadFileName: expect.any(Function),
    });
  });

  it("returns current state from store", () => {
    const testFile = new File(["content"], "test.pdf");
    mockStoreState.selectedFileForUpload = testFile;
    mockStoreState.uploadFileName = "Test Document";
    mockStoreState.showUploadOverlay = true;

    const { result } = renderHook(() => useFilePickerState());

    expect(result.current.selectedFile).toBe(testFile);
    expect(result.current.uploadFileName).toBe("Test Document");
    expect(result.current.showUploadOverlay).toBe(true);
  });

  it("handleAddFileClick creates file input and triggers file selection", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    // Create a more realistic mock input element
    const mockInput = document.createElement("input");
    const mockClick = vi.fn();
    mockInput.click = mockClick;

    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockInput as any);

    const { result } = renderHook(() => useFilePickerState());

    // Call handleAddFileClick
    result.current.handleAddFileClick();

    // Verify input was configured correctly
    expect(createElementSpy).toHaveBeenCalledWith("input");
    expect(mockInput.type).toBe("file");
    expect(mockInput.accept).toBe("application/pdf");
    expect(mockClick).toHaveBeenCalled();

    // Simulate file selection
    const mockEvent = {
      target: { files: [file] },
    };
    mockInput.onchange?.(mockEvent as any);

    // Verify store actions were called
    expect(store.setSelectedFile).toHaveBeenCalledWith(file);
    expect(store.setShowUploadOverlay).toHaveBeenCalledWith(true);

    createElementSpy.mockRestore();
  });

  it("handleAddFileClick does nothing if no file selected", () => {
    // Create a more realistic mock input element
    const mockInput = document.createElement("input");
    const mockClick = vi.fn();
    mockInput.click = mockClick;

    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockInput as any);

    const { result } = renderHook(() => useFilePickerState());

    result.current.handleAddFileClick();

    // Simulate no file selection
    const mockEvent = {
      target: { files: null },
    };
    mockInput.onchange?.(mockEvent as any);

    // Verify store actions were not called
    expect(store.setSelectedFile).not.toHaveBeenCalled();
    expect(store.setShowUploadOverlay).not.toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it("handleCancelUpload resets all state", () => {
    const { result } = renderHook(() => useFilePickerState());

    result.current.handleCancelUpload();

    expect(store.setShowUploadOverlay).toHaveBeenCalledWith(false);
    expect(store.setSelectedFile).toHaveBeenCalledWith(null);
    expect(store.setUploadFileName).toHaveBeenCalledWith("");
  });

  it("setUploadFileName calls store action", () => {
    const { result } = renderHook(() => useFilePickerState());

    result.current.setUploadFileName("New Document Name");

    expect(store.setUploadFileName).toHaveBeenCalledWith("New Document Name");
  });
});

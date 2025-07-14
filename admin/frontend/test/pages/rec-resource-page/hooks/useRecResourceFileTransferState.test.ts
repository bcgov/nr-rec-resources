import { beforeEach, vi } from "vitest";
import {
  setSelectedFile,
  setUploadFileName,
  setShowUploadOverlay,
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
  addErrorNotification,
  addSuccessNotification,
  mutateAsync,
  downloadMutate,
} from "./recResourceFileTransferStore.mock";

vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  recResourceFileTransferStore: {},
  setSelectedFile,
  setUploadFileName,
  setShowUploadOverlay,
  addPendingDoc,
  removePendingDoc,
  updatePendingDoc,
}));

// Type for mockState
interface MockState {
  selectedFile: File | null;
  uploadFileName: string;
  showUploadOverlay: boolean;
  pendingDocs: any[];
}

const mockState: MockState = {
  selectedFile: null,
  uploadFileName: "",
  showUploadOverlay: false,
  pendingDocs: [],
};

vi.mock("@tanstack/react-store", () => ({
  useStore: () => ({
    selectedFileForUpload: mockState.selectedFile,
    uploadFileName: mockState.uploadFileName,
    showUploadOverlay: mockState.showUploadOverlay,
    pendingDocs: mockState.pendingDocs,
  }),
}));

vi.mock(
  "@/services/hooks/recreation-resource-admin/useUploadResourceDocument",
  () => ({
    useUploadResourceDocument: () => ({ mutateAsync }),
  }),
);
vi.mock("@/store/notificationStore", () => ({
  addErrorNotification,
  addSuccessNotification,
}));
vi.mock("@/pages/rec-resource-page/hooks/useDownloadFileMutation", () => ({
  useDownloadFileMutation: () => ({ mutate: downloadMutate }),
}));

import { act, renderHook } from "@testing-library/react";
import { useRecResourceFileTransferState } from "@/pages/rec-resource-page/hooks/useRecResourceFileTransferState";
import * as store from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import * as notif from "@/store/notificationStore";
import * as upload from "@/services/hooks/recreation-resource-admin/useUploadResourceDocument";
import * as download from "@/pages/rec-resource-page/hooks/useDownloadFileMutation";

// Use the real File if available, otherwise a minimal mock
const RealFile = globalThis.File;
if (!RealFile) {
  globalThis.File = class {
    name: string;
    constructor(_: any[], name: string) {
      this.name = name;
    }
  } as any;
}

beforeEach(() => {
  setSelectedFile.mockReset();
  setUploadFileName.mockReset();
  setShowUploadOverlay.mockReset();
  addPendingDoc.mockReset();
  removePendingDoc.mockReset();
  updatePendingDoc.mockReset();
  addErrorNotification.mockReset();
  addSuccessNotification.mockReset();
  mutateAsync.mockReset();
  downloadMutate.mockReset();
  mockState.selectedFile = null;
  mockState.uploadFileName = "";
  mockState.showUploadOverlay = false;
  mockState.pendingDocs = [];
});

describe("useRecResourceFileTransferState", () => {
  it("returns state and handlers", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    expect(result.current).toMatchObject({
      selectedFile: null,
      uploadFileName: "",
      showUploadOverlay: false,
      pendingDocs: [],
      handleAddFileClick: expect.any(Function),
      handleCancelUpload: expect.any(Function),
      setUploadFileName: expect.any(Function),
      getUploadHandler: expect.any(Function),
      getDocumentActionHandler: expect.any(Function),
    });
  });

  it("handleAddFileClick sets file and overlay", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    const input = {
      click: vi.fn(),
      type: "",
      accept: "",
      onchange: (_: any) => {},
    } as any;
    const origCreateElement = document.createElement;
    document.createElement = vi.fn(() => input) as any;
    result.current.handleAddFileClick();
    expect(input.click).toHaveBeenCalled();
    input.onchange({ target: { files: [file] } });
    expect(store.setSelectedFile).toHaveBeenCalledWith(file);
    expect(store.setShowUploadOverlay).toHaveBeenCalledWith(true);
    document.createElement = origCreateElement;
  });

  it("handleCancelUpload resets state", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    result.current.handleCancelUpload();
    expect(store.setShowUploadOverlay).toHaveBeenCalledWith(false);
    expect(store.setSelectedFile).toHaveBeenCalledWith(null);
    expect(store.setUploadFileName).toHaveBeenCalledWith("");
  });

  it("handleUpload adds pending doc and uploads", async () => {
    mockState.selectedFile = new File(["file"], "test.pdf", {
      type: "application/pdf",
    });
    mockState.uploadFileName = "Test";
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useRecResourceFileTransferState());
    await act(() => result.current.getUploadHandler("abc", onSuccess)());
    expect(addPendingDoc).toHaveBeenCalled();
    expect(mutateAsync).toHaveBeenCalledWith({
      recResourceId: "abc",
      file: mockState.selectedFile,
      title: "Test",
    });
    expect(addSuccessNotification).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("handleUpload does nothing if no file or name", async () => {
    mockState.selectedFile = null;
    mockState.uploadFileName = "";
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useRecResourceFileTransferState());
    await act(() => result.current.getUploadHandler("abc", onSuccess)());
    expect(addPendingDoc).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("handleUpload handles upload error", async () => {
    mockState.selectedFile = new File([""], "test.pdf");
    mockState.uploadFileName = "Test";
    const mutateAsync = upload.useUploadResourceDocument().mutateAsync as any;
    mutateAsync.mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const onSuccess = vi.fn();
    await act(() => result.current.getUploadHandler("abc", onSuccess)());
    expect(notif.addErrorNotification).toHaveBeenCalled();
    expect(store.updatePendingDoc).toHaveBeenCalledWith(
      expect.stringContaining("pending-"),
      { isUploading: false, uploadFailed: true },
    );
  });

  it("handleUploadRetry uploads again and updates doc", async () => {
    const pendingDoc = {
      id: "id1",
      name: "Test",
      rec_resource_id: "abc",
      pendingFile: new File([""], "test.pdf"),
      date: new Date().toISOString(),
      url: "",
      extension: "pdf",
    };
    const { result } = renderHook(() => useRecResourceFileTransferState());
    await act(() =>
      result.current.getDocumentActionHandler(vi.fn())("retry", pendingDoc),
    );
    expect(store.updatePendingDoc).toHaveBeenCalledWith("id1", {
      isUploading: true,
      uploadFailed: false,
    });
    expect(mutateAsync).toHaveBeenCalled();
  });

  it("handleUploadRetry does nothing if no pendingFile", async () => {
    const pendingDoc = {
      id: "id1",
      rec_resource_id: "abc",
      name: "Test",
      date: "2023-01-01",
      url: "",
      extension: "pdf",
    };
    const { result } = renderHook(() => useRecResourceFileTransferState());
    await act(() =>
      result.current.getDocumentActionHandler(vi.fn())("retry", pendingDoc),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(updatePendingDoc).not.toHaveBeenCalledWith("id1", {
      isUploading: true,
      uploadFailed: false,
    });
  });

  it("handleDocumentAction view opens window", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const file = {
      url: "http://test",
      name: "Test",
      id: "id1",
      rec_resource_id: "abc",
      date: new Date().toISOString(),
      extension: "pdf",
    };
    const { result } = renderHook(() => useRecResourceFileTransferState());
    result.current.getDocumentActionHandler(vi.fn())("view", file);
    expect(open).toHaveBeenCalledWith("http://test", "_blank");
    open.mockRestore();
  });

  it("handleDocumentAction download calls downloadMutation", () => {
    const file = {
      url: "http://test",
      name: "Test",
      id: "id1",
      rec_resource_id: "abc",
      date: new Date().toISOString(),
      extension: "pdf",
    };
    const { result } = renderHook(() => useRecResourceFileTransferState());
    result.current.getDocumentActionHandler(vi.fn())("download", file);
    expect(download.useDownloadFileMutation().mutate).toHaveBeenCalledWith({
      url: "http://test",
      fileName: "Test",
    });
  });

  it("getUploadHandler returns a function that calls handleUpload", async () => {
    mockState.selectedFile = new File([""], "test.pdf");
    mockState.uploadFileName = "Test";
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const fn = result.current.getUploadHandler("abc", vi.fn());
    expect(typeof fn).toBe("function");
    await act(() => fn());
    expect(store.addPendingDoc).toHaveBeenCalled();
  });

  it("getDocumentActionHandler returns a function that calls handleDocumentAction", () => {
    const { result } = renderHook(() => useRecResourceFileTransferState());
    const fn = result.current.getDocumentActionHandler(vi.fn());
    expect(typeof fn).toBe("function");
    fn("view", {
      url: "http://test",
      name: "Test",
      id: "id1",
      rec_resource_id: "abc",
      date: new Date().toISOString(),
      extension: "pdf",
    });
  });
});

import { Store } from "@tanstack/store";
import { GalleryDocument } from "../types";

export interface RecResourceFileTransferState {
  selectedFileForUpload: File | null;
  uploadFileName: string;
  showUploadOverlay: boolean;
  pendingDocs: GalleryDocument[];
}

export const recResourceFileTransferStore =
  new Store<RecResourceFileTransferState>({
    selectedFileForUpload: null,
    uploadFileName: "",
    showUploadOverlay: false,
    pendingDocs: [],
  });

export function setSelectedFile(file: File | null) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    selectedFileForUpload: file,
  }));
}

export function setUploadFileName(fileName: string) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    uploadFileName: fileName,
  }));
}

export function setShowUploadOverlay(show: boolean) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    showUploadOverlay: show,
  }));
}

export function addPendingDoc(doc: GalleryDocument) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    pendingDocs: [...prev.pendingDocs, doc],
  }));
}

export function updatePendingDoc(
  id: string,
  updates: Partial<GalleryDocument>,
) {
  recResourceFileTransferStore.setState((prev) => {
    const idx = prev.pendingDocs.findIndex((d) => d.id === id);
    if (idx === -1) {
      return prev;
    }
    const updatedDocs = [...prev.pendingDocs];
    updatedDocs[idx] = { ...updatedDocs[idx], ...updates };
    return { ...prev, pendingDocs: updatedDocs };
  });
}

export function removePendingDoc(id: string) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    pendingDocs: prev.pendingDocs.filter((doc) => doc.id !== id),
  }));
}

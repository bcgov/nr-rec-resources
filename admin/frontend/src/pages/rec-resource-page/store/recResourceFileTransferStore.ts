import { Store } from "@tanstack/store";
import { GalleryDocument, GalleryFile } from "../types";

export interface RecResourceFileTransferState {
  selectedFileForUpload: File | null;
  uploadFileName: string;
  showUploadOverlay: boolean;
  pendingDocs: GalleryDocument[];
  galleryDocuments: GalleryDocument[];
  showDeleteModal: boolean;
  docToDelete?: GalleryFile;
}

export const recResourceFileTransferStore =
  new Store<RecResourceFileTransferState>({
    selectedFileForUpload: null,
    uploadFileName: "",
    showUploadOverlay: false,
    pendingDocs: [],
    galleryDocuments: [],
    showDeleteModal: false,
    docToDelete: undefined,
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

export const resetUploadState = () => {
  setShowUploadOverlay(false);
  setSelectedFile(null);
  setUploadFileName("");
};

export function setShowDeleteModal(show: boolean) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    showDeleteModal: show,
  }));
}

export function setDocToDelete(doc?: GalleryFile) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    docToDelete: doc,
  }));
}

export const showDeleteModalForDoc = (doc: GalleryFile) => {
  setDocToDelete(doc);
  setShowDeleteModal(true);
};

export const hideDeleteModal = () => {
  setShowDeleteModal(false);
  setDocToDelete(undefined);
};

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

export function setGalleryDocuments(docs: GalleryDocument[]) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    galleryDocuments: docs,
  }));
}

export function updateGalleryDocument(
  id: string,
  updates: Partial<GalleryDocument>,
) {
  recResourceFileTransferStore.setState((prev) => {
    const idx = prev.galleryDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return prev;
    const updatedDocs = [...prev.galleryDocuments];
    updatedDocs[idx] = { ...updatedDocs[idx], ...updates };
    return { ...prev, galleryDocuments: updatedDocs };
  });
}

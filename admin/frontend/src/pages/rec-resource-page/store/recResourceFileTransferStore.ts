import { Store } from '@tanstack/store';
import { FileType, GalleryDocument, GalleryFile, GalleryImage } from '../types';

export interface RecResourceFileTransferState {
  selectedFileForUpload: GalleryFile | null;
  uploadFileName: string;
  showUploadOverlay: boolean;
  pendingDocs: GalleryDocument[];
  galleryDocuments: GalleryDocument[];
  pendingImages: GalleryImage[];
  galleryImages: GalleryImage[];
  showDeleteModal: boolean;
  fileToDelete?: GalleryFile;
}

const INITIAL_REC_RESOURCE_FILE_TRANSFER_STATE: RecResourceFileTransferState = {
  selectedFileForUpload: null,
  uploadFileName: '',
  showUploadOverlay: false,
  pendingDocs: [],
  galleryDocuments: [],
  pendingImages: [],
  galleryImages: [],
  showDeleteModal: false,
  fileToDelete: undefined,
};

export const recResourceFileTransferStore =
  new Store<RecResourceFileTransferState>({
    ...INITIAL_REC_RESOURCE_FILE_TRANSFER_STATE,
  });

export function setSelectedFile(file: GalleryFile | null) {
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
  setUploadFileName('');
};

export function setShowDeleteModal(show: boolean) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    showDeleteModal: show,
  }));
}

export function setFileToDelete(file?: GalleryFile) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    fileToDelete: file,
  }));
}

export const showDeleteModalForFile = (file: GalleryFile) => {
  setFileToDelete(file);
  setShowDeleteModal(true);
};

export const hideDeleteModal = () => {
  setShowDeleteModal(false);
  setFileToDelete(undefined);
};

function addPendingFile<T extends GalleryFile>(file: T, type: FileType): void {
  recResourceFileTransferStore.setState((prev) => {
    if (type === 'document') {
      return {
        ...prev,
        pendingDocs: [...prev.pendingDocs, file as GalleryDocument],
      };
    } else {
      return {
        ...prev,
        pendingImages: [...prev.pendingImages, file as GalleryImage],
      };
    }
  });
}

function updatePendingFile<T extends GalleryFile>(
  id: string,
  updates: Partial<T>,
  type: FileType,
): void {
  recResourceFileTransferStore.setState((prev) => {
    if (type === 'document') {
      const idx = prev.pendingDocs.findIndex((d) => d.id === id);
      if (idx === -1) return prev;
      const updatedDocs = [...prev.pendingDocs];
      updatedDocs[idx] = { ...updatedDocs[idx], ...updates };
      return { ...prev, pendingDocs: updatedDocs };
    } else {
      const idx = prev.pendingImages.findIndex((img) => img.id === id);
      if (idx === -1) return prev;
      const updatedImages = [...prev.pendingImages];
      updatedImages[idx] = { ...updatedImages[idx], ...updates };
      return { ...prev, pendingImages: updatedImages };
    }
  });
}

function removePendingFile(id: string, type: FileType): void {
  recResourceFileTransferStore.setState((prev) => {
    if (type === 'document') {
      return {
        ...prev,
        pendingDocs: prev.pendingDocs.filter((doc) => doc.id !== id),
      };
    } else {
      return {
        ...prev,
        pendingImages: prev.pendingImages.filter((img) => img.id !== id),
      };
    }
  });
}

function updateGalleryFile<T extends GalleryFile>(
  id: string,
  updates: Partial<T>,
  type: FileType,
): void {
  recResourceFileTransferStore.setState((prev) => {
    if (type === 'document') {
      const idx = prev.galleryDocuments.findIndex((d) => d.id === id);
      if (idx === -1) return prev;
      const updatedDocs = [...prev.galleryDocuments];
      updatedDocs[idx] = { ...updatedDocs[idx], ...updates };
      return { ...prev, galleryDocuments: updatedDocs };
    } else {
      const idx = prev.galleryImages.findIndex((img) => img.id === id);
      if (idx === -1) return prev;
      const updatedImages = [...prev.galleryImages];
      updatedImages[idx] = { ...updatedImages[idx], ...updates };
      return { ...prev, galleryImages: updatedImages };
    }
  });
}

export function addPendingDoc(doc: GalleryDocument) {
  addPendingFile(doc, 'document');
}

export function updatePendingDoc(
  id: string,
  updates: Partial<GalleryDocument>,
) {
  updatePendingFile(id, updates, 'document');
}

export function removePendingDoc(id: string) {
  removePendingFile(id, 'document');
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
  updateGalleryFile(id, updates, 'document');
}

export function addPendingImage(image: GalleryImage) {
  addPendingFile(image, 'image');
}

export function updatePendingImage(id: string, updates: Partial<GalleryImage>) {
  updatePendingFile(id, updates, 'image');
}

export function removePendingImage(id: string) {
  removePendingFile(id, 'image');
}

export function setGalleryImages(images: GalleryImage[]) {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    galleryImages: images,
  }));
}

export function updateGalleryImage(id: string, updates: Partial<GalleryImage>) {
  updateGalleryFile(id, updates, 'image');
}

export function resetRecResourceFileTransferStore() {
  recResourceFileTransferStore.setState({
    ...INITIAL_REC_RESOURCE_FILE_TRANSFER_STATE,
  });
}

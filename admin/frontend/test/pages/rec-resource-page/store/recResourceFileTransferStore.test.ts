import {
  addPendingDoc,
  addPendingImage,
  hideDeleteModal,
  recResourceFileTransferStore,
  removePendingDoc,
  removePendingImage,
  resetRecResourceFileTransferStore,
  resetUploadState,
  setFileToDelete,
  setGalleryDocuments,
  setGalleryImages,
  setSelectedFile,
  setShowDeleteModal,
  setShowUploadOverlay,
  setUploadFileName,
  showDeleteModalForFile,
  updateGalleryDocument,
  updateGalleryImage,
  updatePendingDoc,
  updatePendingImage,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import {
  GalleryDocument,
  GalleryFile,
  GalleryImage,
} from '@/pages/rec-resource-page/types';
import { beforeEach, describe, expect, it } from 'vitest';

const baseDoc: GalleryDocument = {
  id: '1',
  name: 'doc1.pdf',
  date: '2024-01-01',
  url: 'http://example.com/doc1.pdf',
  extension: 'pdf',
  type: 'document',
};

const anotherDoc: GalleryDocument = {
  id: '2',
  name: 'doc2.pdf',
  date: '2024-01-02',
  url: 'http://example.com/doc2.pdf',
  extension: 'pdf',
  type: 'document',
};

const baseImage: GalleryImage = {
  id: 'img1',
  name: 'image1.jpg',
  date: '2024-01-01',
  url: 'http://example.com/image1.jpg',
  extension: 'jpg',
  type: 'image',
  variants: [],
  previewUrl: 'http://example.com/preview1.jpg',
};

const anotherImage: GalleryImage = {
  id: 'img2',
  name: 'image2.png',
  date: '2024-01-02',
  url: 'http://example.com/image2.png',
  extension: 'png',
  type: 'image',
  variants: [],
  previewUrl: 'http://example.com/preview2.png',
};

describe('recResourceFileTransferStore', () => {
  beforeEach(() => {
    recResourceFileTransferStore.setState({
      selectedFileForUpload: null,
      uploadFileName: '',
      showUploadOverlay: false,
      pendingDocs: [],
      galleryDocuments: [],
      pendingImages: [],
      galleryImages: [],
      showDeleteModal: false,
      fileToDelete: undefined,
    });
  });

  it('sets selected file', () => {
    const file: GalleryFile = {
      id: 'test-file',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com/test.pdf',
      extension: 'pdf',
      type: 'document',
      pendingFile: new File(['content'], 'test.pdf'),
    };
    setSelectedFile(file);
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBe(file);
    setSelectedFile(null);
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBeNull();
  });

  it('sets upload file name', () => {
    setUploadFileName('test.pdf');
    expect(recResourceFileTransferStore.state.uploadFileName).toBe('test.pdf');
  });

  it('sets show upload overlay', () => {
    setShowUploadOverlay(true);
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(true);
    setShowUploadOverlay(false);
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(false);
  });

  it('resets upload state', () => {
    // Set some initial state
    const file: GalleryFile = {
      id: 'test-file',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com/test.pdf',
      extension: 'pdf',
      type: 'document',
      pendingFile: new File(['content'], 'test.pdf'),
    };
    setSelectedFile(file);
    setUploadFileName('test-file.pdf');
    setShowUploadOverlay(true);

    // Verify state is set
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBe(file);
    expect(recResourceFileTransferStore.state.uploadFileName).toBe(
      'test-file.pdf',
    );
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(true);

    // Reset upload state
    resetUploadState();

    // Verify all upload-related state is reset
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBeNull();
    expect(recResourceFileTransferStore.state.uploadFileName).toBe('');
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(false);
  });

  it('adds a pending doc', () => {
    addPendingDoc(baseDoc);
    expect(recResourceFileTransferStore.state.pendingDocs).toContain(baseDoc);
  });

  it('updates a pending doc (existing id)', () => {
    addPendingDoc(baseDoc);
    updatePendingDoc('1', { name: 'updated.pdf' });
    expect(recResourceFileTransferStore.state.pendingDocs[0].name).toBe(
      'updated.pdf',
    );
  });

  it('does not update if id not found', () => {
    addPendingDoc(baseDoc);
    const prev = recResourceFileTransferStore.state.pendingDocs.slice();
    updatePendingDoc('notfound', { name: 'should-not-update.pdf' });
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual(prev);
  });

  it('returns previous state if id is not found (coverage)', () => {
    addPendingDoc(baseDoc);
    const prevState = { ...recResourceFileTransferStore.state };
    updatePendingDoc('non-existent-id', { name: 'should-not-update.pdf' });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });

  it('updates with partial fields', () => {
    addPendingDoc(baseDoc);
    updatePendingDoc('1', { extension: 'docx' });
    expect(recResourceFileTransferStore.state.pendingDocs[0].extension).toBe(
      'docx',
    );
    expect(recResourceFileTransferStore.state.pendingDocs[0].name).toBe(
      'doc1.pdf',
    );
  });

  it('does nothing if pendingDocs is empty', () => {
    updatePendingDoc('1', { name: 'should-not-update.pdf' });
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([]);
  });

  it('removes a pending doc', () => {
    addPendingDoc(baseDoc);
    addPendingDoc(anotherDoc);
    removePendingDoc('1');
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([
      anotherDoc,
    ]);
  });

  it('sets show delete modal', () => {
    setShowDeleteModal(true);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    setShowDeleteModal(false);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(false);
  });

  it('sets doc to delete', () => {
    const doc: GalleryDocument = {
      id: '1',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com',
      extension: 'pdf',
      type: 'document',
    };
    setFileToDelete(doc);
    expect(recResourceFileTransferStore.state.fileToDelete).toBe(doc);
    setFileToDelete(undefined);
    expect(recResourceFileTransferStore.state.fileToDelete).toBeUndefined();
  });

  it('shows delete modal for doc', () => {
    const doc: GalleryDocument = {
      id: '1',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com',
      extension: 'pdf',
      type: 'document',
    };

    showDeleteModalForFile(doc);

    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    expect(recResourceFileTransferStore.state.fileToDelete).toBe(doc);
  });

  it('hides delete modal', () => {
    const doc: GalleryDocument = {
      id: '1',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com',
      extension: 'pdf',
      type: 'document',
    };

    // First set up the modal as shown
    showDeleteModalForFile(doc);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    expect(recResourceFileTransferStore.state.fileToDelete).toBe(doc);

    // Now hide the modal
    hideDeleteModal();

    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(false);
    expect(recResourceFileTransferStore.state.fileToDelete).toBeUndefined();
  });

  it('sets gallery documents', () => {
    const docs: GalleryDocument[] = [baseDoc, anotherDoc];
    setGalleryDocuments(docs);
    expect(recResourceFileTransferStore.state.galleryDocuments).toEqual(docs);
  });

  it('updates gallery document when id exists', () => {
    setGalleryDocuments([baseDoc, anotherDoc]);
    updateGalleryDocument('1', { name: 'updated-gallery.pdf' });
    expect(recResourceFileTransferStore.state.galleryDocuments[0].name).toBe(
      'updated-gallery.pdf',
    );
  });

  it('does not update gallery document when id does not exist', () => {
    setGalleryDocuments([baseDoc]);
    const prevState = { ...recResourceFileTransferStore.state };
    updateGalleryDocument('non-existent', { name: 'should-not-update.pdf' });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });

  it('removes a pending image', () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      pendingImages: [baseImage, anotherImage],
    }));
    removePendingImage('img1');
    expect(recResourceFileTransferStore.state.pendingImages).toEqual([
      anotherImage,
    ]);
  });

  it('adds a pending image', () => {
    addPendingImage(baseImage);
    expect(recResourceFileTransferStore.state.pendingImages).toEqual([
      baseImage,
    ]);
  });

  it('updates a pending image (existing id)', () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      pendingImages: [baseImage, anotherImage],
    }));
    updatePendingImage('img1', { name: 'updated-image.jpg' });
    expect(recResourceFileTransferStore.state.pendingImages[0].name).toBe(
      'updated-image.jpg',
    );
  });

  it('does not update pending image if id not found', () => {
    recResourceFileTransferStore.setState((prev) => ({
      ...prev,
      pendingImages: [baseImage],
    }));
    const prevState = { ...recResourceFileTransferStore.state };
    updatePendingImage('non-existent', { name: 'should-not-update.jpg' });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });

  it('sets gallery images', () => {
    const images: GalleryImage[] = [baseImage, anotherImage];
    setGalleryImages(images);
    expect(recResourceFileTransferStore.state.galleryImages).toEqual(images);
  });

  it('updates gallery image when id exists', () => {
    setGalleryImages([baseImage, anotherImage]);
    updateGalleryImage('img1', { name: 'updated-image.jpg' });
    expect(recResourceFileTransferStore.state.galleryImages[0].name).toBe(
      'updated-image.jpg',
    );
  });

  it('does not update gallery image when id does not exist', () => {
    setGalleryImages([baseImage]);
    const prevState = { ...recResourceFileTransferStore.state };
    updateGalleryImage('non-existent', { name: 'should-not-update.jpg' });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });

  it('resets the entire store to initial state', () => {
    // Set up some state that should be reset
    const file: GalleryFile = {
      id: 'test-file',
      name: 'test.pdf',
      date: '2024-01-01',
      url: 'http://example.com/test.pdf',
      extension: 'pdf',
      type: 'document',
      pendingFile: new File(['content'], 'test.pdf'),
    };

    setSelectedFile(file);
    setUploadFileName('test-upload.pdf');
    setShowUploadOverlay(true);
    addPendingDoc(baseDoc);
    setGalleryDocuments([anotherDoc]);
    addPendingImage(baseImage);
    setGalleryImages([anotherImage]);
    showDeleteModalForFile(baseDoc);

    // Verify state is set
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBe(file);
    expect(recResourceFileTransferStore.state.uploadFileName).toBe(
      'test-upload.pdf',
    );
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(true);
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([baseDoc]);
    expect(recResourceFileTransferStore.state.galleryDocuments).toEqual([
      anotherDoc,
    ]);
    expect(recResourceFileTransferStore.state.pendingImages).toEqual([
      baseImage,
    ]);
    expect(recResourceFileTransferStore.state.galleryImages).toEqual([
      anotherImage,
    ]);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    expect(recResourceFileTransferStore.state.fileToDelete).toBe(baseDoc);

    // Reset the entire store
    resetRecResourceFileTransferStore();

    // Verify all state is reset to initial values
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBeNull();
    expect(recResourceFileTransferStore.state.uploadFileName).toBe('');
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(false);
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([]);
    expect(recResourceFileTransferStore.state.galleryDocuments).toEqual([]);
    expect(recResourceFileTransferStore.state.pendingImages).toEqual([]);
    expect(recResourceFileTransferStore.state.galleryImages).toEqual([]);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(false);
    expect(recResourceFileTransferStore.state.fileToDelete).toBeUndefined();
  });
});

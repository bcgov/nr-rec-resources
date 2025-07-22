import {
  addPendingDoc,
  hideDeleteModal,
  recResourceFileTransferStore,
  removePendingDoc,
  resetUploadState,
  setDocToDelete,
  setGalleryDocuments,
  setSelectedFile,
  setShowDeleteModal,
  setShowUploadOverlay,
  setUploadFileName,
  showDeleteModalForDoc,
  updateGalleryDocument,
  updatePendingDoc,
} from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { beforeEach, describe, expect, it } from "vitest";

const baseDoc = {
  id: "1",
  name: "doc1.pdf",
  date: "2024-01-01",
  url: "http://example.com/doc1.pdf",
  extension: "pdf",
  rec_resource_id: "res1",
};

const anotherDoc = {
  id: "2",
  name: "doc2.pdf",
  date: "2024-01-02",
  url: "http://example.com/doc2.pdf",
  extension: "pdf",
  rec_resource_id: "res1",
};

describe("recResourceFileTransferStore", () => {
  beforeEach(() => {
    recResourceFileTransferStore.setState({
      selectedFileForUpload: null,
      uploadFileName: "",
      showUploadOverlay: false,
      pendingDocs: [],
      galleryDocuments: [],
      showDeleteModal: false,
      docToDelete: undefined,
    });
  });

  it("sets selected file", () => {
    const file = new File(["content"], "test.pdf");
    setSelectedFile(file);
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBe(file);
    setSelectedFile(null);
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBeNull();
  });

  it("sets upload file name", () => {
    setUploadFileName("test.pdf");
    expect(recResourceFileTransferStore.state.uploadFileName).toBe("test.pdf");
  });

  it("sets show upload overlay", () => {
    setShowUploadOverlay(true);
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(true);
    setShowUploadOverlay(false);
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(false);
  });

  it("resets upload state", () => {
    // Set some initial state
    const file = new File(["content"], "test.pdf");
    setSelectedFile(file);
    setUploadFileName("test-file.pdf");
    setShowUploadOverlay(true);

    // Verify state is set
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBe(file);
    expect(recResourceFileTransferStore.state.uploadFileName).toBe(
      "test-file.pdf",
    );
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(true);

    // Reset upload state
    resetUploadState();

    // Verify all upload-related state is reset
    expect(recResourceFileTransferStore.state.selectedFileForUpload).toBeNull();
    expect(recResourceFileTransferStore.state.uploadFileName).toBe("");
    expect(recResourceFileTransferStore.state.showUploadOverlay).toBe(false);
  });

  it("adds a pending doc", () => {
    addPendingDoc(baseDoc);
    expect(recResourceFileTransferStore.state.pendingDocs).toContain(baseDoc);
  });

  it("updates a pending doc (existing id)", () => {
    addPendingDoc(baseDoc);
    updatePendingDoc("1", { name: "updated.pdf" });
    expect(recResourceFileTransferStore.state.pendingDocs[0].name).toBe(
      "updated.pdf",
    );
  });

  it("does not update if id not found", () => {
    addPendingDoc(baseDoc);
    const prev = recResourceFileTransferStore.state.pendingDocs.slice();
    updatePendingDoc("notfound", { name: "should-not-update.pdf" });
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual(prev);
  });

  it("returns previous state if id is not found (coverage)", () => {
    addPendingDoc(baseDoc);
    const prevState = { ...recResourceFileTransferStore.state };
    updatePendingDoc("non-existent-id", { name: "should-not-update.pdf" });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });

  it("updates with partial fields", () => {
    addPendingDoc(baseDoc);
    updatePendingDoc("1", { extension: "docx" });
    expect(recResourceFileTransferStore.state.pendingDocs[0].extension).toBe(
      "docx",
    );
    expect(recResourceFileTransferStore.state.pendingDocs[0].name).toBe(
      "doc1.pdf",
    );
  });

  it("does nothing if pendingDocs is empty", () => {
    updatePendingDoc("1", { name: "should-not-update.pdf" });
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([]);
  });

  it("removes a pending doc", () => {
    addPendingDoc(baseDoc);
    addPendingDoc(anotherDoc);
    removePendingDoc("1");
    expect(recResourceFileTransferStore.state.pendingDocs).toEqual([
      anotherDoc,
    ]);
  });

  it("sets show delete modal", () => {
    setShowDeleteModal(true);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    setShowDeleteModal(false);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(false);
  });

  it("sets doc to delete", () => {
    const doc = {
      id: "1",
      name: "test.pdf",
      date: "2024-01-01",
      url: "http://example.com",
      extension: "pdf",
    };
    setDocToDelete(doc);
    expect(recResourceFileTransferStore.state.docToDelete).toBe(doc);
    setDocToDelete(undefined);
    expect(recResourceFileTransferStore.state.docToDelete).toBeUndefined();
  });

  it("shows delete modal for doc", () => {
    const doc = {
      id: "1",
      name: "test.pdf",
      date: "2024-01-01",
      url: "http://example.com",
      extension: "pdf",
    };

    showDeleteModalForDoc(doc);

    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    expect(recResourceFileTransferStore.state.docToDelete).toBe(doc);
  });

  it("hides delete modal", () => {
    const doc = {
      id: "1",
      name: "test.pdf",
      date: "2024-01-01",
      url: "http://example.com",
      extension: "pdf",
    };

    // First set up the modal as shown
    showDeleteModalForDoc(doc);
    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(true);
    expect(recResourceFileTransferStore.state.docToDelete).toBe(doc);

    // Now hide the modal
    hideDeleteModal();

    expect(recResourceFileTransferStore.state.showDeleteModal).toBe(false);
    expect(recResourceFileTransferStore.state.docToDelete).toBeUndefined();
  });

  it("sets gallery documents", () => {
    const docs = [baseDoc, anotherDoc];
    setGalleryDocuments(docs);
    expect(recResourceFileTransferStore.state.galleryDocuments).toEqual(docs);
  });

  it("updates gallery document when id exists", () => {
    setGalleryDocuments([baseDoc, anotherDoc]);
    updateGalleryDocument("1", { name: "updated-gallery.pdf" });
    expect(recResourceFileTransferStore.state.galleryDocuments[0].name).toBe(
      "updated-gallery.pdf",
    );
  });

  it("does not update gallery document when id does not exist", () => {
    setGalleryDocuments([baseDoc]);
    const prevState = { ...recResourceFileTransferStore.state };
    updateGalleryDocument("non-existent", { name: "should-not-update.pdf" });
    expect(recResourceFileTransferStore.state).toEqual(prevState);
  });
});

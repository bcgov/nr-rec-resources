import {
  recResourceFileTransferStore,
  setSelectedFile,
  setUploadFileName,
  setShowUploadOverlay,
  addPendingDoc,
  updatePendingDoc,
  removePendingDoc,
} from "../../../../src/pages/rec-resource-page/store/recResourceFileTransferStore";
import { describe, it, expect, beforeEach } from "vitest";

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
});

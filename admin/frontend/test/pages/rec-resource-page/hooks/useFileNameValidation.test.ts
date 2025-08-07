import { useFileNameValidation } from "@/pages/rec-resource-page/hooks/useFileNameValidation";
import {
  GalleryDocument,
  GalleryFile,
  GalleryImage,
} from "@/pages/rec-resource-page/types";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockStoreState: any = {};
vi.mock("@tanstack/react-store", () => ({
  useStore: () => mockStoreState,
}));

const mockDocuments: GalleryDocument[] = [
  {
    id: "1",
    name: "existing-doc.pdf",
    date: "2024-01-01",
    url: "http://example.com/doc.pdf",
    extension: "pdf",
    type: "document",
  },
  {
    id: "2",
    name: "another-doc.docx",
    date: "2024-01-02",
    url: "http://example.com/doc2.docx",
    extension: "docx",
    type: "document",
  },
];

const mockImages: GalleryImage[] = [
  {
    id: "img1",
    name: "existing-image.jpg",
    date: "2024-01-01",
    url: "http://example.com/image.jpg",
    extension: "jpg",
    type: "image",
    variants: [],
    previewUrl: "http://example.com/preview.jpg",
  },
  {
    id: "img2",
    name: "another-image.png",
    date: "2024-01-02",
    url: "http://example.com/image2.png",
    extension: "png",
    type: "image",
    variants: [],
    previewUrl: "http://example.com/preview2.png",
  },
];

const mockDocumentFile: GalleryFile = {
  id: "new-doc",
  name: "new-document.pdf",
  date: "2024-01-03",
  url: "http://example.com/new-doc.pdf",
  extension: "pdf",
  type: "document",
  pendingFile: new File(["content"], "new-document.pdf"),
};

const mockImageFile: GalleryFile = {
  id: "new-img",
  name: "new-image.jpg",
  date: "2024-01-03",
  url: "http://example.com/new-image.jpg",
  extension: "jpg",
  type: "image",
  pendingFile: new File(["content"], "new-image.jpg"),
};

describe("useFileNameValidation", () => {
  afterEach(() => {
    mockStoreState = {};
  });

  it("returns no error for valid filename with no selected file", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: null,
      uploadFileName: "some-file.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBeUndefined();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isValid).toBe(false); // No selected file means not valid
  });

  it("returns no error for valid document filename", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "unique-document.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBeUndefined();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("returns error for duplicate document filename", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "existing-doc.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBe(
      "A file with this name already exists. Please choose a different name",
    );
    expect(result.current.hasError).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("returns error for duplicate document filename with different case", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "EXISTING-DOC.PDF",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBe(
      "A file with this name already exists. Please choose a different name",
    );
    expect(result.current.hasError).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("returns no error for valid image filename", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockImageFile,
      uploadFileName: "unique-image.jpg",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBeUndefined();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("returns error for duplicate image filename", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockImageFile,
      uploadFileName: "existing-image.jpg",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBe(
      "A file with this name already exists. Please choose a different name",
    );
    expect(result.current.hasError).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("validates against correct file type (document vs image)", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "existing-image.jpg",
    };
    const { result: documentResult } = renderHook(() =>
      useFileNameValidation(),
    );
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockImageFile,
      uploadFileName: "existing-doc.pdf",
    };
    const { result: imageResult } = renderHook(() => useFileNameValidation());
    expect(documentResult.current.fileNameError).toBeUndefined();
    expect(documentResult.current.isValid).toBe(true);
    expect(imageResult.current.fileNameError).toBeUndefined();
    expect(imageResult.current.isValid).toBe(true);
  });

  it("returns error for empty filename", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBe("File name is required"); // Empty filename returns no validation result
    expect(result.current.hasError).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("returns error for filename that becomes empty after trim", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "valid-name.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    // Test the validateFileName function with empty string
    const emptyResult = result.current.validateFileName("");
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success && "error" in emptyResult) {
      expect(emptyResult.error.issues[0]?.message).toBe(
        "File name is required",
      );
    }
  });

  it("returns error for filename with invalid characters", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "invalid<>file.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBe(
      "File name contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, periods, and parentheses are allowed",
    );
    expect(result.current.hasError).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("validateFileName function works correctly", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "current-name.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    const validResult = result.current.validateFileName("unique-name.pdf");
    expect(validResult.success).toBe(true);
    const duplicateResult = result.current.validateFileName("existing-doc.pdf");
    expect(duplicateResult.success).toBe(false);
    if (!duplicateResult.success && "error" in duplicateResult) {
      expect(duplicateResult.error.issues[0]?.message).toBe(
        "A file with this name already exists. Please choose a different name",
      );
    }
  });

  it("handles empty galleries gracefully", () => {
    mockStoreState = {
      galleryDocuments: [],
      galleryImages: [],
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "any-name.pdf",
    };
    const { result } = renderHook(() => useFileNameValidation());
    expect(result.current.fileNameError).toBeUndefined();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("handles validator memoization correctly", () => {
    // Initial render
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "test-name.pdf",
    };
    const { result, rerender } = renderHook(() => useFileNameValidation());
    const firstValidator = result.current.validateFileName;

    // Rerender with same data - validator should be memoized
    rerender();
    expect(result.current.validateFileName).toBe(firstValidator);

    // Change existing files - validator should update
    mockStoreState = {
      ...mockStoreState,
      galleryDocuments: [
        ...mockDocuments,
        {
          id: "3",
          name: "new-doc.pdf",
          date: "2024-01-03",
          url: "http://example.com/doc3.pdf",
          extension: "pdf",
          type: "document",
        },
      ],
    };
    rerender();
    expect(result.current.validateFileName).not.toBe(firstValidator);
  });

  it("handles validation result memoization correctly", () => {
    mockStoreState = {
      galleryDocuments: mockDocuments,
      galleryImages: mockImages,
      selectedFileForUpload: mockDocumentFile,
      uploadFileName: "test-name.pdf",
    };
    const { result, rerender } = renderHook(() => useFileNameValidation());
    const firstError = result.current.fileNameError;

    // Rerender with same filename - error should be memoized
    rerender();
    expect(result.current.fileNameError).toBe(firstError);

    // Change filename - error should update
    mockStoreState = {
      ...mockStoreState,
      uploadFileName: "existing-doc.pdf",
    };
    rerender();
    expect(result.current.fileNameError).not.toBe(firstError);
    expect(result.current.fileNameError).toBe(
      "A file with this name already exists. Please choose a different name",
    );
  });
});

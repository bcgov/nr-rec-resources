import {
  isImageFile,
  getImagePreviewUrl,
  validateImageFile,
} from "@/utils/imageUtils";
import * as imageUtils from "@/utils/imageUtils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Image Utils", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("mocked-object-url");
  });
  afterEach(() => vi.restoreAllMocks());

  // Use vi.stubGlobal for URL only
  beforeAll(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "mocked-object-url"),
      revokeObjectURL: vi.fn(),
    });
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe("isImageFile", () => {
    const validExts = [
      "jpg",
      "jpeg",
      "PNG",
      "HEIC",
      "webp",
      "gif",
      "bmp",
      "TIFF",
    ];
    const invalidNames = [
      "document.pdf",
      "archive.zip",
      "text.txt",
      "image.svg",
      "image",
    ];
    it("should return true for valid image extensions (case-insensitive)", () => {
      validExts.forEach((ext) => {
        expect(isImageFile(new File([], `image.${ext}`))).toBe(true);
      });
    });
    it("should return false for invalid image extensions", () => {
      invalidNames.forEach((name) => {
        expect(isImageFile(new File([], name))).toBe(false);
      });
    });
    it("should return true for files with multiple dots in the name but valid extension", () => {
      expect(isImageFile(new File([], "my.image.file.jpg"))).toBe(true);
    });
    it("should return false for file with empty name", () => {
      expect(isImageFile(new File([], ""))).toBe(false);
    });
  });

  describe("getImagePreviewUrl", () => {
    it("should call URL.createObjectURL with the file and return its result", () => {
      const file = new File([""], "test.png", { type: "image/png" });
      const url = getImagePreviewUrl(file);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(url).toBe("mocked-object-url");
    });
  });

  describe("validateImageFile", () => {
    let isImageFileMock: any;
    beforeEach(() => {
      isImageFileMock = vi.spyOn(imageUtils, "isImageFile");
    });
    afterEach(() => isImageFileMock.mockRestore());

    const makeFile = (name: string, size: number, type = "image/jpeg") => {
      const file = new File([""], name, { type });
      Object.defineProperty(file, "size", { value: size });
      return file;
    };

    it("should return null for a valid image file within size limits", () => {
      isImageFileMock.mockReturnValue(true);
      expect(
        validateImageFile(makeFile("valid.jpg", 5 * 1024 * 1024)),
      ).toBeNull();
    });
    it('should return "Invalid image file type." for a non-image file', () => {
      isImageFileMock.mockReturnValue(false);
      expect(
        validateImageFile(
          makeFile("document.pdf", 1 * 1024 * 1024, "application/pdf"),
        ),
      ).toBe("Invalid image file type.");
    });
    it("should return an error message for an image file exceeding the default size limit (10MB)", () => {
      isImageFileMock.mockReturnValue(true);
      expect(
        validateImageFile(makeFile("large.png", 11 * 1024 * 1024, "image/png")),
      ).toBe("Image must be less than 10MB.");
    });
    it("should return an error message for an image file exceeding a custom size limit", () => {
      isImageFileMock.mockReturnValue(true);
      expect(
        validateImageFile(
          makeFile("very-large.gif", 6 * 1024 * 1024, "image/gif"),
          5,
        ),
      ).toBe("Image must be less than 5MB.");
    });
    it("should return null for an image file exactly at the default size limit", () => {
      isImageFileMock.mockReturnValue(true);
      expect(
        validateImageFile(makeFile("exact.bmp", 10 * 1024 * 1024, "image/bmp")),
      ).toBeNull();
    });
    it("should return null for an image file exactly at a custom size limit", () => {
      isImageFileMock.mockReturnValue(true);
      expect(
        validateImageFile(
          makeFile("exact-custom.tiff", 2 * 1024 * 1024, "image/tiff"),
          2,
        ),
      ).toBeNull();
    });
    it("should return error for file with no name", () => {
      isImageFileMock.mockReturnValue(false);
      expect(validateImageFile(makeFile("", 1 * 1024))).toBe(
        "Invalid image file type.",
      );
    });
    it("should return error for empty file (size 0)", () => {
      isImageFileMock.mockReturnValue(true);
      expect(validateImageFile(makeFile("empty.jpg", 0))).toBeNull();
    });
  });
});

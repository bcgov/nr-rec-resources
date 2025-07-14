import {
  downloadBlobAsFile,
  downloadUrlAsFile,
  getFileNameWithoutExtension,
} from "@/utils/fileUtils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Use vi.stubGlobal for URL only
beforeAll(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:http://localhost/fake"),
    revokeObjectURL: vi.fn(),
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
});

// Minimal Node mock for anchor elements in test environment
class MockAnchorElement {
  href = "";
  download = "";
  click = vi.fn();
}

describe("fileUtils", () => {
  describe("getFileNameWithoutExtension", () => {
    it("should remove file extension", () => {
      const file = new File(["test content"], "example.test.txt");
      const result = getFileNameWithoutExtension(file);
      expect(result).toBe("example.test");
    });
    it("should return full name if there is no extension", () => {
      const file = new File(["test content"], "filename");
      const result = getFileNameWithoutExtension(file);
      expect(result).toBe("filename");
    });
  });

  describe("downloadBlobAsFile", () => {
    let createObjectURLSpy: any;
    let revokeObjectURLSpy: any;
    let appendChildSpy: ReturnType<typeof vi.fn>;
    let removeChildSpy: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.fn>;
    const realCreateElement = document.createElement;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
      revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");
      clickSpy = vi.fn();
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          const anchor = realCreateElement.call(document, "a");
          anchor.click = clickSpy;
          return anchor;
        }
        return realCreateElement.call(document, tag);
      });
      appendChildSpy = vi.spyOn(document.body as any, "appendChild") as any;
      removeChildSpy = vi.spyOn(document.body as any, "removeChild") as any;
    });
    afterEach(() => vi.restoreAllMocks());

    it("should create a link and trigger download", () => {
      const blob = new Blob(["hello world"], { type: "text/plain" });
      downloadBlobAsFile(blob, "test.txt");
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it("should handle errors gracefully", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      createObjectURLSpy.mockImplementation(() => {
        throw new Error("Test error");
      });
      const blob = new Blob(["test"]);
      downloadBlobAsFile(blob, "error.txt");
      expect(errorSpy).toHaveBeenCalledWith(
        "Download failed:",
        expect.any(Error),
      );
    });
  });

  describe("downloadUrlAsFile", () => {
    const originalFetch = global.fetch;
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        blob: vi
          .fn()
          .mockResolvedValue(
            new Blob(["fetched content"], { type: "text/plain" }),
          ),
      }) as unknown as typeof fetch;
      vi.spyOn(document, "createElement").mockImplementation(
        () => new MockAnchorElement() as unknown as HTMLAnchorElement,
      );
      vi.spyOn(document.body, "appendChild" as any);
      vi.spyOn(document.body, "removeChild" as any);
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    });
    afterEach(() => {
      global.fetch = originalFetch;
      vi.restoreAllMocks();
    });
    it("should fetch the URL and download the file", async () => {
      await downloadUrlAsFile("https://example.com/test.txt", "fetched.txt");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/test.txt",
        { mode: "cors" },
      );
    });
  });
});

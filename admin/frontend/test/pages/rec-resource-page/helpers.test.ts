import {
  formatDocumentDate,
  handleAddFileClick,
  handleAddPdfFileClick,
} from "@/pages/rec-resource-page/helpers";
import {
  setSelectedFile,
  setShowUploadOverlay,
} from "@/pages/rec-resource-page/store/recResourceFileTransferStore";
import { afterEach, beforeEach, vi } from "vitest";

// Mock the store functions
vi.mock("@/pages/rec-resource-page/store/recResourceFileTransferStore", () => ({
  setSelectedFile: vi.fn(),
  setShowUploadOverlay: vi.fn(),
}));

describe("formatDocumentDate", () => {
  it("formats ISO date string to en-CA format", () => {
    // 2023-07-13T15:30:00Z UTC
    const result = formatDocumentDate("2023-07-13T15:30:00Z");
    // The output will depend on the local timezone, so just check for expected substrings
    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/\d{2}/); // day
    expect(result).toMatch(/\d{2}:\d{2}/); // time
  });

  it("handles invalid date string gracefully", () => {
    const result = formatDocumentDate("not-a-date");
    expect(result).toBe("Invalid Date");
  });

  it("formats date with correct time format (12-hour with AM/PM)", () => {
    const result = formatDocumentDate("2023-12-25T09:15:00Z");
    // Check for either AM/PM or a.m./p.m. format (depending on locale)
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|a\.m\.|p\.m\.)/i);
  });

  it("formats date with correct day format (2-digit)", () => {
    const result = formatDocumentDate("2023-01-05T12:00:00Z");
    expect(result).toMatch(/\b0[1-9]\b|\b[12][0-9]\b|\b3[01]\b/); // 2-digit day format
  });
});

describe("handleAddFileClick", () => {
  let mockInput: HTMLInputElement;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a mock input element
    mockInput = {
      type: "",
      accept: "",
      style: { display: "" },
      onchange: null,
      click: vi.fn(),
      files: null,
    } as unknown as HTMLInputElement;

    // Mock document methods
    originalCreateElement = document.createElement;
    originalAppendChild = document.body.appendChild;
    originalRemoveChild = document.body.removeChild;

    document.createElement = vi.fn().mockReturnValue(mockInput);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    // Restore original methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it("creates a file input with correct properties", () => {
    const acceptType = "application/pdf";
    handleAddFileClick(acceptType);

    expect(document.createElement).toHaveBeenCalledWith("input");
    expect(mockInput.type).toBe("file");
    expect(mockInput.accept).toBe(acceptType);
    expect(mockInput.style.display).toBe("none");
  });

  it("appends input to document body and clicks it", () => {
    handleAddFileClick("application/pdf");

    expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
    expect(mockInput.click).toHaveBeenCalled();
  });

  it("handles file selection correctly", () => {
    const mockFile = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    handleAddFileClick("application/pdf");

    // Simulate file selection
    mockInput.files = [mockFile] as unknown as FileList;
    const mockEvent = {
      target: mockInput,
    } as unknown as Event;

    // Trigger the onchange event
    if (mockInput.onchange) {
      mockInput.onchange(mockEvent);
    }

    expect(setSelectedFile).toHaveBeenCalledWith(mockFile);
    expect(setShowUploadOverlay).toHaveBeenCalledWith(true);
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it("handles case when no file is selected", () => {
    handleAddFileClick("application/pdf");

    // Simulate no file selection (files is null)
    mockInput.files = null;
    const mockEvent = {
      target: mockInput,
    } as unknown as Event;

    // Trigger the onchange event
    if (mockInput.onchange) {
      mockInput.onchange(mockEvent);
    }

    expect(setSelectedFile).not.toHaveBeenCalled();
    expect(setShowUploadOverlay).not.toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it("handles case when files array is empty", () => {
    handleAddFileClick("application/pdf");

    // Simulate empty files array
    mockInput.files = [] as unknown as FileList;
    const mockEvent = {
      target: mockInput,
    } as unknown as Event;

    // Trigger the onchange event
    if (mockInput.onchange) {
      mockInput.onchange(mockEvent);
    }

    expect(setSelectedFile).not.toHaveBeenCalled();
    expect(setShowUploadOverlay).not.toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it("accepts different file types", () => {
    const acceptTypes = [
      "application/pdf",
      "image/*",
      "application/msword",
      ".doc,.docx,.pdf",
    ];

    acceptTypes.forEach((acceptType) => {
      vi.clearAllMocks();
      handleAddFileClick(acceptType);
      expect(mockInput.accept).toBe(acceptType);
    });
  });
});

describe("handleAddPdfFileClick", () => {
  let mockInput: HTMLInputElement;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInput = {
      type: "",
      accept: "",
      style: { display: "" },
      onchange: null,
      click: vi.fn(),
      files: null,
    } as unknown as HTMLInputElement;

    originalCreateElement = document.createElement;
    originalAppendChild = document.body.appendChild;
    originalRemoveChild = document.body.removeChild;

    document.createElement = vi.fn().mockReturnValue(mockInput);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it("calls handleAddFileClick with PDF mime type", () => {
    handleAddPdfFileClick();

    expect(document.createElement).toHaveBeenCalledWith("input");
    expect(mockInput.accept).toBe("application/pdf");
    expect(mockInput.type).toBe("file");
    expect(mockInput.click).toHaveBeenCalled();
  });

  it("restricts file selection to PDF files only", () => {
    handleAddPdfFileClick();
    expect(mockInput.accept).toBe("application/pdf");
  });
});

import {
  createTempGalleryFile,
  formatGalleryFileDate,
  getMaxFilesByFileType,
  handleAddFileByType,
  handleAddFileClick,
} from '@/pages/rec-resource-page/helpers';
import {
  setSelectedFile,
  setShowUploadOverlay,
  setUploadFileName,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-object-url'),
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  writable: true,
  value: vi.fn(() => 'mocked-uuid'),
});

// Mock the store functions
vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setSelectedFile: vi.fn(),
  setShowUploadOverlay: vi.fn(),
  setUploadFileName: vi.fn(),
}));

describe('formatGalleryFileDate', () => {
  it('formats ISO date string to en-CA format', () => {
    // 2023-07-13T15:30:00Z UTC
    const result = formatGalleryFileDate('2023-07-13T15:30:00Z');
    // The output will depend on the local timezone, so just check for expected substrings
    expect(result).toMatch(/Jul/);
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/\d{2}/); // day
    expect(result).toMatch(/\d{2}:\d{2}/); // time
  });

  it('handles invalid date string gracefully', () => {
    const result = formatGalleryFileDate('not-a-date');
    expect(result).toBe('Invalid Date');
  });

  it('formats date with correct time format (12-hour with AM/PM)', () => {
    const result = formatGalleryFileDate('2023-12-25T09:15:00Z');
    // Check for either AM/PM or a.m./p.m. format (depending on locale)
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM|a\.m\.|p\.m\.)/i);
  });

  it('formats date with correct day format (2-digit)', () => {
    const result = formatGalleryFileDate('2023-01-05T12:00:00Z');
    expect(result).toMatch(/\b0[1-9]\b|\b[12][0-9]\b|\b3[01]\b/); // 2-digit day format
  });
});

describe('handleAddFileClick', () => {
  let mockInput: HTMLInputElement;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a mock input element
    mockInput = {
      type: '',
      accept: '',
      style: { display: '' },
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

  it('creates a file input with correct properties', () => {
    const acceptType = 'application/pdf';
    handleAddFileClick(acceptType, 'document');

    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(mockInput.type).toBe('file');
    expect(mockInput.accept).toBe(acceptType);
    expect(mockInput.style.display).toBe('none');
  });

  it('appends input to document body and clicks it', () => {
    handleAddFileClick('application/pdf', 'document');

    expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
    expect(mockInput.click).toHaveBeenCalled();
  });

  it('handles file selection correctly', () => {
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    handleAddFileClick('application/pdf', 'document');

    // Simulate file selection
    mockInput.files = [mockFile] as unknown as FileList;
    const mockEvent = {
      target: mockInput,
    } as unknown as Event;

    // Trigger the onchange event
    if (mockInput.onchange) {
      mockInput.onchange(mockEvent);
    }

    expect(setSelectedFile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test.pdf',
        type: 'document',
        pendingFile: mockFile,
      }),
    );
    expect(setShowUploadOverlay).toHaveBeenCalledWith(true);
    expect(setUploadFileName).toHaveBeenCalledWith('test');
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it('handles case when no file is selected', () => {
    handleAddFileClick('application/pdf', 'document');

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

  it('handles case when files array is empty', () => {
    handleAddFileClick('application/pdf', 'document');

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

  it('accepts different file types', () => {
    const acceptTypes = [
      { accept: 'application/pdf', type: 'document' as const },
      { accept: 'image/*', type: 'image' as const },
      { accept: 'application/msword', type: 'document' as const },
      { accept: '.doc,.docx,.pdf', type: 'document' as const },
    ];

    acceptTypes.forEach(({ accept, type }) => {
      vi.clearAllMocks();
      handleAddFileClick(accept, type);
      expect(mockInput.accept).toBe(accept);
    });
  });
});

describe('handleAddPdfFileClick', () => {
  let mockInput: HTMLInputElement;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInput = {
      type: '',
      accept: '',
      style: { display: '' },
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

  it('calls handleAddFileClick with PDF mime type', () => {
    handleAddFileByType('document');

    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(mockInput.accept).toBe('application/pdf');
    expect(mockInput.type).toBe('file');
    expect(mockInput.click).toHaveBeenCalled();
  });

  it('restricts file selection to PDF files only', () => {
    handleAddFileByType('document');
    expect(mockInput.accept).toBe('application/pdf');
  });
});

describe('createTempGalleryFile', () => {
  it('creates temp gallery file with extension from file name', () => {
    const mockFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    const result = createTempGalleryFile(mockFile, 'image');

    expect(result.id).toMatch(/^temp-\d+-mocked-uuid$/);
    expect(result.name).toBe('test-image.jpg');
    expect(result.extension).toBe('jpg');
    expect(result.url).toBe('mocked-object-url');
    expect(result.pendingFile).toBe(mockFile);
    expect(result.type).toBe('image');
    expect(result.date).toMatch(
      /[A-Za-z]{3}\s\d{1,2},\s\d{4},\s\d{1,2}:\d{2}\s[ap]\.m\./,
    );
  });

  it('handles file name without extension (empty string fallback)', () => {
    const mockFile = new File(['content'], 'filename.', {
      type: 'application/pdf',
    });
    const result = createTempGalleryFile(mockFile, 'document');

    expect(result.extension).toBe('');
    expect(result.name).toBe('filename.');
    expect(result.type).toBe('document');
    expect(result.url).toBe('mocked-object-url');
  });

  it('handles file name with multiple dots', () => {
    const mockFile = new File(['content'], 'file.name.with.multiple.dots.png', {
      type: 'image/png',
    });
    const result = createTempGalleryFile(mockFile, 'image');

    expect(result.extension).toBe('png');
    expect(result.name).toBe('file.name.with.multiple.dots.png');
    expect(result.url).toBe('mocked-object-url');
  });

  it('handles uppercase file extension', () => {
    const mockFile = new File(['content'], 'document.PDF', {
      type: 'application/pdf',
    });
    const result = createTempGalleryFile(mockFile, 'document');

    expect(result.extension).toBe('pdf');
    expect(result.name).toBe('document.PDF');
    expect(result.url).toBe('mocked-object-url');
  });
});

describe('getMaxFilesByFileType', () => {
  it('returns correct max files for image type', () => {
    const result = getMaxFilesByFileType('image');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('returns correct max files for document type', () => {
    const result = getMaxFilesByFileType('document');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
});

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
import { addErrorNotification } from '@/store/notificationStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setSelectedFile: vi.fn(),
  setShowUploadOverlay: vi.fn(),
  setUploadFileName: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

// Helper to create mock input element
function createMockInput(): HTMLInputElement {
  return {
    type: '',
    accept: '',
    style: { display: '' },
    onchange: null,
    click: vi.fn(),
    files: null,
  } as unknown as HTMLInputElement;
}

// Helper to simulate file selection
function simulateFileSelection(
  mockInput: HTMLInputElement,
  files: File | File[] | null,
): void {
  mockInput.files = (files
    ? Array.isArray(files)
      ? files
      : [files]
    : null) as unknown as FileList;
  const mockEvent = { target: mockInput } as unknown as Event;
  mockInput.onchange?.(mockEvent);
}

describe('formatGalleryFileDate', () => {
  it.each([
    ['2023-07-13T15:30:00Z', /Jul/],
    ['2023-12-25T09:15:00Z', /\d{1,2}:\d{2}\s?(AM|PM|a\.m\.|p\.m\.)/i],
    ['2023-01-05T12:00:00Z', /\b0[1-9]\b|\b[12][0-9]\b|\b3[01]\b/],
  ])('formats date correctly for %s', (date, pattern) => {
    const result = formatGalleryFileDate(date);
    expect(result).toMatch(pattern);
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('handles invalid date string gracefully', () => {
    expect(formatGalleryFileDate('not-a-date')).toBe('Invalid Date');
  });
});

describe('handleAddFileClick', () => {
  let mockInput: HTMLInputElement;
  const originalMethods = {
    createElement: document.createElement,
    appendChild: document.body.appendChild,
    removeChild: document.body.removeChild,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInput = createMockInput();
    document.createElement = vi.fn().mockReturnValue(mockInput);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    Object.assign(document, { createElement: originalMethods.createElement });
    Object.assign(document.body, {
      appendChild: originalMethods.appendChild,
      removeChild: originalMethods.removeChild,
    });
  });

  it('creates and configures file input correctly', () => {
    const acceptType = 'application/pdf';
    handleAddFileClick(acceptType, 'document');

    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(mockInput.type).toBe('file');
    expect(mockInput.accept).toBe(acceptType);
    expect(mockInput.style.display).toBe('none');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
    expect(mockInput.click).toHaveBeenCalled();
  });

  it('processes valid file selection correctly', () => {
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    handleAddFileClick('application/pdf', 'document');
    simulateFileSelection(mockInput, mockFile);

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

  it.each([
    ['no file selected', null],
    ['empty files array', []],
  ])('handles case when %s', (_, files) => {
    handleAddFileClick('application/pdf', 'document');
    simulateFileSelection(mockInput, files);

    expect(setSelectedFile).not.toHaveBeenCalled();
    expect(setShowUploadOverlay).not.toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });

  it.each([
    ['application/pdf', 'document'],
    ['image/*', 'image'],
    ['application/msword', 'document'],
    ['.doc,.docx,.pdf', 'document'],
  ])('accepts %s file type', (accept, type) => {
    handleAddFileClick(accept, type as 'document' | 'image');
    expect(mockInput.accept).toBe(accept);
  });

  it('rejects invalid files and shows notification without opening modal', () => {
    const mockAddErrorNotification = vi.mocked(addErrorNotification);

    const largeFile = new File(['test content'], 'large-file.pdf', {
      type: 'application/pdf',
    });
    // Make file larger than limit
    Object.defineProperty(largeFile, 'size', {
      value: 10 * 1024 * 1024, // 10MB > 9.5MB limit
      writable: false,
    });

    handleAddFileClick('application/pdf', 'document');
    simulateFileSelection(mockInput, largeFile);

    // Invalid file should show notification and NOT open modal
    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      expect.stringContaining('too big'),
    );
    expect(setSelectedFile).not.toHaveBeenCalled();
    expect(setShowUploadOverlay).not.toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
  });
});

describe('handleAddFileByType', () => {
  let mockInput: HTMLInputElement;
  const originalMethods = {
    createElement: document.createElement,
    appendChild: document.body.appendChild,
    removeChild: document.body.removeChild,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInput = createMockInput();
    document.createElement = vi.fn().mockReturnValue(mockInput);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    Object.assign(document, { createElement: originalMethods.createElement });
    Object.assign(document.body, {
      appendChild: originalMethods.appendChild,
      removeChild: originalMethods.removeChild,
    });
  });

  it.each([
    ['document', 'application/pdf'],
    ['image', 'image/png,image/jpg,image/jpeg,image/webp'],
  ])(
    'calls handleAddFileClick with correct mime type for %s',
    (type, expectedAccept) => {
      handleAddFileByType(type as 'document' | 'image');
      expect(mockInput.accept).toBe(expectedAccept);
      expect(mockInput.type).toBe('file');
      expect(mockInput.click).toHaveBeenCalled();
    },
  );
});

describe('createTempGalleryFile', () => {
  it('creates temp gallery file with all required properties', () => {
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

  it.each([
    ['filename.', '', 'document'],
    ['file.name.with.multiple.dots.png', 'png', 'image'],
    ['document.PDF', 'pdf', 'document'],
  ])('handles file name "%s" correctly', (fileName, expectedExt, type) => {
    const mockFile = new File(['content'], fileName, {
      type: type === 'image' ? 'image/png' : 'application/pdf',
    });
    const result = createTempGalleryFile(
      mockFile,
      type as 'document' | 'image',
    );

    expect(result.extension).toBe(expectedExt);
    expect(result.name).toBe(fileName);
    expect(result.type).toBe(type);
    expect(result.url).toBe('mocked-object-url');
  });
});

describe('getMaxFilesByFileType', () => {
  it.each(['image', 'document'] as const)(
    'returns a positive number for %s type',
    (type) => {
      expect(getMaxFilesByFileType(type)).toBeGreaterThan(0);
    },
  );
});

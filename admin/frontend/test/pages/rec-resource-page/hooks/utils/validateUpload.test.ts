import { validateUploadFile } from '@/pages/rec-resource-page/hooks/utils/validateUpload';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { describe, expect, it } from 'vitest';

describe('validateUploadFile', () => {
  const createMockGalleryFile = (
    overrides: Partial<GalleryFile> = {},
  ): GalleryFile => ({
    id: 'test-id',
    name: 'test-file.pdf',
    date: '2024-01-01',
    url: '',
    extension: 'pdf',
    type: 'document',
    pendingFile: new File(['content'], 'test-file.pdf'),
    ...overrides,
  });

  it('should return true for valid file with all required fields', () => {
    const file = createMockGalleryFile();
    const result = validateUploadFile('test-resource-id', file);

    expect(result).toBe(true);
  });

  it('should return false if recResourceId is missing', () => {
    const file = createMockGalleryFile();
    const result = validateUploadFile(undefined, file);

    expect(result).toBe(false);
  });

  it('should return false if recResourceId is empty string', () => {
    const file = createMockGalleryFile();
    const result = validateUploadFile('', file);

    expect(result).toBe(false);
  });

  it('should return false if pendingFile is missing', () => {
    const file = createMockGalleryFile({ pendingFile: undefined });
    const result = validateUploadFile('test-resource-id', file);

    expect(result).toBe(false);
  });

  it('should return false if name is missing', () => {
    const file = createMockGalleryFile({ name: '' });
    const result = validateUploadFile('test-resource-id', file);

    expect(result).toBe(false);
  });

  it('should return false if name is undefined', () => {
    const file = createMockGalleryFile({ name: undefined });
    const result = validateUploadFile('test-resource-id', file);

    expect(result).toBe(false);
  });

  it('should handle custom requiredFields array', () => {
    const file = createMockGalleryFile({ name: undefined });
    // Only require pendingFile, not name
    const result = validateUploadFile('test-resource-id', file, [
      'pendingFile',
    ]);

    expect(result).toBe(true);
  });

  it('should return false if custom required field is missing', () => {
    const file = createMockGalleryFile({ pendingFile: undefined });
    // Require both pendingFile and name
    const result = validateUploadFile('test-resource-id', file, [
      'pendingFile',
      'name',
    ]);

    expect(result).toBe(false);
  });

  it('should return false if multiple fields are missing', () => {
    const file = createMockGalleryFile({
      pendingFile: undefined,
      name: '',
    });
    const result = validateUploadFile('test-resource-id', file);

    expect(result).toBe(false);
  });

  it('should return true when only pendingFile is required and present', () => {
    const file = createMockGalleryFile({ name: undefined });
    const result = validateUploadFile('test-resource-id', file, [
      'pendingFile',
    ]);

    expect(result).toBe(true);
  });
});

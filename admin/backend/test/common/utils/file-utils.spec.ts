import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import {
  createMimeTypeRegexPattern,
  extractExtension,
  extractFileMetadata,
  extractFilenameWithoutExtension,
  formatFileSize,
  validateFileBuffer,
  validateFileRequired,
  validateFileSize,
  validateMimeType,
} from '@/common/utils/file.utils';
import { HttpStatus } from '@nestjs/common';
import { createMockFile } from 'test/test-utils/file-test-utils';
import { describe, expect, it } from 'vitest';

describe('file-utils', () => {
  describe('extractFilenameWithoutExtension', () => {
    it('should extract filename without extension', () => {
      expect(extractFilenameWithoutExtension('document.pdf')).toBe('document');
    });

    it('should handle files with multiple dots', () => {
      expect(extractFilenameWithoutExtension('my.file.name.pdf')).toBe(
        'my.file.name',
      );
    });

    it('should handle files without extension', () => {
      expect(extractFilenameWithoutExtension('document')).toBe('document');
    });

    it('should handle files with path', () => {
      expect(extractFilenameWithoutExtension('/path/to/document.pdf')).toBe(
        'document',
      );
    });

    it('should handle Windows paths', () => {
      expect(
        extractFilenameWithoutExtension('C:\\path\\to\\document.pdf'),
      ).toBe('document');
    });

    it.each([
      ['empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('should throw for %s', (_, input) => {
      expect(() => extractFilenameWithoutExtension(input as any)).toThrow();
    });
  });

  describe('extractExtension', () => {
    it('should extract extension without dot', () => {
      expect(extractExtension('document.pdf')).toBe('pdf');
    });

    it('should handle uppercase extensions', () => {
      expect(extractExtension('document.PDF')).toBe('PDF');
    });

    it('should handle files with multiple dots', () => {
      expect(extractExtension('my.file.name.pdf')).toBe('pdf');
    });

    it('should return empty string for files without extension', () => {
      expect(extractExtension('document')).toBe('');
    });

    it('should handle files with path', () => {
      expect(extractExtension('/path/to/document.pdf')).toBe('pdf');
    });

    it.each([
      ['empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('should throw for %s', (_, input) => {
      expect(() => extractExtension(input as any)).toThrow();
    });
  });

  describe('extractFileMetadata', () => {
    it('should extract both filename and extension', () => {
      const file = createMockFile({ originalname: 'document.pdf' });
      const result = extractFileMetadata(file);

      expect(result.filename).toBe('document');
      expect(result.extension).toBe('pdf');
    });

    it('should handle files with multiple dots', () => {
      const file = createMockFile('my.file.name.pdf');
      const result = extractFileMetadata(file);

      expect(result.filename).toBe('my.file.name');
      expect(result.extension).toBe('pdf');
    });

    it('should handle files without extension', () => {
      const file = createMockFile('document');
      const result = extractFileMetadata(file);

      expect(result.filename).toBe('document');
      expect(result.extension).toBe('');
    });

    it('should handle uppercase extensions', () => {
      const file = createMockFile('document.PDF');
      const result = extractFileMetadata(file);

      expect(result.filename).toBe('document');
      expect(result.extension).toBe('PDF');
    });

    it.each([
      ['empty originalname', ''],
      ['undefined originalname', undefined],
    ])('should throw for %s', (_, originalname) => {
      const file = { ...createMockFile('document.pdf'), originalname };
      expect(() => extractFileMetadata(file as any)).toThrow();
    });
  });

  describe('validateFileRequired', () => {
    it('should not throw for valid file', () => {
      const file = createMockFile({ originalname: 'document.pdf' });
      expect(() => validateFileRequired(file)).not.toThrow();
    });

    it('should throw FileValidationException when file is undefined', () => {
      expect(() => validateFileRequired(undefined)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileRequired(undefined)).toThrow('File is required');
    });

    it('should throw FileValidationException when buffer is undefined', () => {
      const file = { ...createMockFile('document.pdf'), buffer: undefined };
      expect(() => validateFileRequired(file as any)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileRequired(file as any)).toThrow(
        'File buffer is required',
      );
    });

    it('should throw FileValidationException when buffer is null', () => {
      const file = { ...createMockFile('document.pdf'), buffer: null };
      expect(() => validateFileRequired(file as any)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileRequired(file as any)).toThrow(
        'File buffer is required',
      );
    });

    it('should throw FileValidationException when originalname is missing', () => {
      const file = { ...createMockFile('document.pdf'), originalname: '' };
      expect(() => validateFileRequired(file)).toThrow(FileValidationException);
      expect(() => validateFileRequired(file)).toThrow('File name is required');
    });
  });

  describe('validateFileBuffer', () => {
    it('should not throw for valid file with buffer', () => {
      const file = createMockFile({ originalname: 'document.pdf' });
      expect(() => validateFileBuffer(file)).not.toThrow();
    });

    it('should throw FileValidationException when file is undefined', () => {
      expect(() => validateFileBuffer(undefined)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileBuffer(undefined)).toThrow(
        'File buffer cannot be empty',
      );
    });

    it('should throw FileValidationException when buffer is undefined', () => {
      const file = { ...createMockFile('document.pdf'), buffer: undefined };
      expect(() => validateFileBuffer(file as any)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileBuffer(file as any)).toThrow(
        'File buffer cannot be empty',
      );
    });

    it('should throw FileValidationException when buffer is null', () => {
      const file = { ...createMockFile('document.pdf'), buffer: null };
      expect(() => validateFileBuffer(file as any)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileBuffer(file as any)).toThrow(
        'File buffer cannot be empty',
      );
    });

    it('should throw FileValidationException when buffer is empty', () => {
      const file = {
        ...createMockFile('document.pdf'),
        buffer: Buffer.from(''),
      };
      expect(() => validateFileBuffer(file)).toThrow(FileValidationException);
      expect(() => validateFileBuffer(file)).toThrow(
        'File buffer cannot be empty',
      );
    });
  });

  describe('validateMimeType', () => {
    it('should not throw for allowed MIME type', () => {
      expect(() =>
        validateMimeType('application/pdf', ['application/pdf']),
      ).not.toThrow();
    });

    it('should not throw for case-insensitive MIME type match', () => {
      expect(() =>
        validateMimeType('APPLICATION/PDF', ['application/pdf']),
      ).not.toThrow();
    });

    it('should not throw when MIME type matches any allowed type', () => {
      expect(() =>
        validateMimeType('image/jpeg', [
          'application/pdf',
          'image/jpeg',
          'image/png',
        ]),
      ).not.toThrow();
    });

    it('should throw FileValidationException when mimetype is undefined', () => {
      expect(() => validateMimeType(undefined, ['application/pdf'])).toThrow(
        FileValidationException,
      );
      expect(() => validateMimeType(undefined, ['application/pdf'])).toThrow(
        'File has no MIME type',
      );
      try {
        validateMimeType(undefined, ['application/pdf']);
      } catch (error) {
        expect(error).toBeInstanceOf(FileValidationException);
        expect((error as FileValidationException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw FileValidationException when mimetype is not allowed', () => {
      expect(() => validateMimeType('text/plain', ['application/pdf'])).toThrow(
        FileValidationException,
      );
      expect(() => validateMimeType('text/plain', ['application/pdf'])).toThrow(
        'File Type not allowed',
      );
      try {
        validateMimeType('text/plain', ['application/pdf']);
      } catch (error) {
        expect(error).toBeInstanceOf(FileValidationException);
        expect((error as FileValidationException).getStatus()).toBe(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
    });

    it('should include field name in error message when provided', () => {
      expect(() =>
        validateMimeType(undefined, ['application/pdf'], 'document'),
      ).toThrow("File field 'document' has no MIME type");

      expect(() =>
        validateMimeType('text/plain', ['application/pdf'], 'document'),
      ).toThrow(
        "File field 'document' must be one of: application/pdf. Received: text/plain",
      );
    });

    it('should handle MIME types with special regex characters', () => {
      expect(() =>
        validateMimeType('application/vnd.ms-excel', [
          'application/vnd.ms-excel',
        ]),
      ).not.toThrow();

      expect(() =>
        validateMimeType('application/vnd.ms-excel', ['application/pdf']),
      ).toThrow(FileValidationException);
    });
  });

  describe('validateFileSize', () => {
    it('should not throw when file size is within limit', () => {
      expect(() => validateFileSize(1024, 2048)).not.toThrow();
      expect(() => validateFileSize(2048, 2048)).not.toThrow();
    });

    it('should throw FileValidationException when file exceeds maximum size', () => {
      expect(() => validateFileSize(3072, 2048)).toThrow(
        FileValidationException,
      );
      expect(() => validateFileSize(3072, 2048)).toThrow(
        'File exceeds maximum size',
      );
      try {
        validateFileSize(3072, 2048);
      } catch (error) {
        expect(error).toBeInstanceOf(FileValidationException);
        expect((error as FileValidationException).getStatus()).toBe(
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }
    });

    it('should include formatted file sizes in error message', () => {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const fileSize = 3 * 1024 * 1024; // 3MB

      expect(() => validateFileSize(fileSize, maxSize)).toThrow('2.00MB');
      expect(() => validateFileSize(fileSize, maxSize)).toThrow('3.00MB');
    });

    it('should include field name in error message when provided', () => {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const fileSize = 3 * 1024 * 1024; // 3MB

      expect(() => validateFileSize(fileSize, maxSize, 'document')).toThrow(
        "File field 'document' exceeds maximum size",
      );
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes to MB string', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00MB');
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.00MB');
      expect(formatFileSize(1536 * 1024)).toBe('1.50MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0.00MB');
    });

    it('should handle fractional MB values', () => {
      expect(formatFileSize(512 * 1024)).toBe('0.50MB');
      expect(formatFileSize(256 * 1024)).toBe('0.25MB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1024 * 1024 + 512)).toBe('1.00MB');
      expect(formatFileSize(1024 * 1024 + 1024 * 512)).toBe('1.50MB');
    });
  });

  describe('createMimeTypeRegexPattern', () => {
    it('should create regex pattern from single MIME type', () => {
      const pattern = createMimeTypeRegexPattern(['application/pdf']);
      expect(pattern).toBe('(application/pdf)');
    });

    it('should create regex pattern from multiple MIME types', () => {
      const pattern = createMimeTypeRegexPattern([
        'application/pdf',
        'image/jpeg',
        'image/png',
      ]);
      expect(pattern).toBe('(application/pdf|image/jpeg|image/png)');
    });

    it('should escape special regex characters', () => {
      const pattern = createMimeTypeRegexPattern([
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]);
      expect(pattern).toContain('application/vnd\\.ms-excel');
      expect(pattern).toContain(
        'application/vnd\\.openxmlformats-officedocument\\.spreadsheetml\\.sheet',
      );
    });

    it('should return empty string for empty array', () => {
      const pattern = createMimeTypeRegexPattern([]);
      expect(pattern).toBe('');
    });

    it('should handle MIME types with plus signs', () => {
      const pattern = createMimeTypeRegexPattern(['application/vnd.api+json']);
      expect(pattern).toContain('application/vnd\\.api\\+json');
    });

    it('should handle MIME types with asterisks', () => {
      const pattern = createMimeTypeRegexPattern(['image/*']);
      expect(pattern).toContain('image/\\*');
    });
  });
});

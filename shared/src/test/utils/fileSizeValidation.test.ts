import { describe, expect, it } from 'vitest';
import {
  buildFileTooLargeMessage,
  isFileTooLarge,
  megabytesToBytes,
  validateFileSize,
} from '@shared/utils/fileSizeValidation';

describe('fileSizeValidation', () => {
  describe('megabytesToBytes', () => {
    it('should convert megabytes to bytes correctly', () => {
      expect(megabytesToBytes(1)).toBe(1024 * 1024);
      expect(megabytesToBytes(9.5)).toBe(9.5 * 1024 * 1024);
      expect(megabytesToBytes(10)).toBe(10 * 1024 * 1024);
      expect(megabytesToBytes(0)).toBe(0);
    });

    it('should handle decimal values correctly', () => {
      expect(megabytesToBytes(0.5)).toBe(0.5 * 1024 * 1024);
      expect(megabytesToBytes(2.5)).toBe(2.5 * 1024 * 1024);
    });
  });

  describe('isFileTooLarge', () => {
    it('should return true when file exceeds max size', () => {
      const maxSizeBytes = megabytesToBytes(10);
      const largeFile = new File(['x'.repeat(maxSizeBytes + 1)], 'large.txt');
      expect(isFileTooLarge(largeFile, maxSizeBytes)).toBe(true);
    });

    it('should return false when file is within size limit', () => {
      const maxSizeBytes = megabytesToBytes(10);
      const smallFile = new File(['x'.repeat(maxSizeBytes - 1)], 'small.txt');
      expect(isFileTooLarge(smallFile, maxSizeBytes)).toBe(false);
    });

    it('should return false when file is exactly at the size limit', () => {
      const maxSizeBytes = megabytesToBytes(10);
      const exactFile = new File(['x'.repeat(maxSizeBytes)], 'exact.txt');
      expect(isFileTooLarge(exactFile, maxSizeBytes)).toBe(false);
    });

    it('should handle empty files', () => {
      const maxSizeBytes = megabytesToBytes(10);
      const emptyFile = new File([], 'empty.txt');
      expect(isFileTooLarge(emptyFile, maxSizeBytes)).toBe(false);
    });

    it('should handle very small size limits', () => {
      const maxSizeBytes = 100; // 100 bytes
      const smallFile = new File(['x'.repeat(50)], 'small.txt');
      const largeFile = new File(['x'.repeat(150)], 'large.txt');
      expect(isFileTooLarge(smallFile, maxSizeBytes)).toBe(false);
      expect(isFileTooLarge(largeFile, maxSizeBytes)).toBe(true);
    });
  });

  describe('buildFileTooLargeMessage', () => {
    it('should build error message with file name and size limit', () => {
      const message = buildFileTooLargeMessage('test.pdf', 9.5);
      expect(message).toBe(
        'Whoops, the file "test.pdf" is too big. Please upload a file smaller than 9.5MB.',
      );
    });

    it('should handle different file names', () => {
      const message1 = buildFileTooLargeMessage('document.docx', 10);
      expect(message1).toBe(
        'Whoops, the file "document.docx" is too big. Please upload a file smaller than 10MB.',
      );

      const message2 = buildFileTooLargeMessage('image.jpg', 5);
      expect(message2).toBe(
        'Whoops, the file "image.jpg" is too big. Please upload a file smaller than 5MB.',
      );
    });

    it('should handle file names with special characters', () => {
      const message = buildFileTooLargeMessage('file name (1).pdf', 9.5);
      expect(message).toBe(
        'Whoops, the file "file name (1).pdf" is too big. Please upload a file smaller than 9.5MB.',
      );
    });

    it('should handle decimal size limits', () => {
      const message = buildFileTooLargeMessage('test.txt', 2.5);
      expect(message).toBe(
        'Whoops, the file "test.txt" is too big. Please upload a file smaller than 2.5MB.',
      );
    });
  });

  describe('validateFileSize', () => {
    it('should return null for files within size limit', () => {
      const maxSizeMB = 10;
      const maxSizeBytes = megabytesToBytes(maxSizeMB);
      const file = new File(['x'.repeat(maxSizeBytes - 1)], 'valid.txt');
      expect(validateFileSize(file, maxSizeMB)).toBeNull();
    });

    it('should return error message for files exceeding size limit', () => {
      const maxSizeMB = 10;
      const maxSizeBytes = megabytesToBytes(maxSizeMB);
      // File significantly over limit (beyond tolerance) should fail
      const wayOverLimit = maxSizeBytes * 1.05; // 5% over (exceeds 2% tolerance)
      const file = new File(
        ['x'.repeat(Math.floor(wayOverLimit))],
        'large.txt',
      );
      const result = validateFileSize(file, maxSizeMB);
      expect(result).toBe(
        'Whoops, the file "large.txt" is too big. Please upload a file smaller than 10MB.',
      );
    });

    it('should use provided file name in error message', () => {
      const maxSizeMB = 9.5;
      const maxSizeBytes = megabytesToBytes(maxSizeMB);
      // File significantly over limit (beyond tolerance) should fail
      const wayOverLimit = maxSizeBytes * 1.05; // 5% over (exceeds 2% tolerance)
      const file = new File(
        ['x'.repeat(Math.floor(wayOverLimit))],
        'original-name.txt',
      );
      const customFileName = 'custom-name.pdf';
      const result = validateFileSize(file, maxSizeMB, customFileName);
      expect(result).toBe(
        'Whoops, the file "custom-name.pdf" is too big. Please upload a file smaller than 9.5MB.',
      );
    });

    it('should use file.name when custom file name is not provided', () => {
      const maxSizeMB = 5;
      const maxSizeBytes = megabytesToBytes(maxSizeMB);
      // File significantly over limit (beyond tolerance) should fail
      const wayOverLimit = maxSizeBytes * 1.05; // 5% over (exceeds 2% tolerance)
      const file = new File(
        ['x'.repeat(Math.floor(wayOverLimit))],
        'default-name.jpg',
      );
      const result = validateFileSize(file, maxSizeMB);
      expect(result).toBe(
        'Whoops, the file "default-name.jpg" is too big. Please upload a file smaller than 5MB.',
      );
    });

    it('should return null for files exactly at the size limit', () => {
      const maxSizeMB = 10;
      const maxSizeBytes = megabytesToBytes(maxSizeMB);
      const file = new File(['x'.repeat(maxSizeBytes)], 'exact.txt');
      expect(validateFileSize(file, maxSizeMB)).toBeNull();
    });

    it('should allow files slightly over binary limit due to tolerance (decimal vs binary conversion)', () => {
      const maxSizeMB = 25;
      const maxSizeBytes = megabytesToBytes(maxSizeMB); // Binary: 26,214,400 bytes
      // File showing as exactly 25MB in file explorer (decimal: 25,000,000 bytes) should pass
      const decimal25MB = 25 * 1000 * 1000; // 25,000,000 bytes
      const file = new File(['x'.repeat(decimal25MB)], '25mb-decimal.txt');
      expect(validateFileSize(file, maxSizeMB)).toBeNull();

      // File slightly over binary limit but within 2% tolerance should pass
      const slightlyOverBinary = maxSizeBytes * 1.015; // 1.5% over (within 2% tolerance)
      const file2 = new File(
        ['x'.repeat(Math.floor(slightlyOverBinary))],
        'slightly-over.txt',
      );
      expect(validateFileSize(file2, maxSizeMB)).toBeNull();

      // File at exactly 2% tolerance should pass
      const atTolerance = maxSizeBytes * 1.02; // Exactly 2% tolerance
      const file3 = new File(
        ['x'.repeat(Math.floor(atTolerance))],
        'at-tolerance.txt',
      );
      expect(validateFileSize(file3, maxSizeMB)).toBeNull();

      // File significantly over tolerance limit should fail
      const wayOver = maxSizeBytes * 1.03; // 3% over (exceeds 2% tolerance)
      const file4 = new File(['x'.repeat(Math.floor(wayOver))], 'way-over.txt');
      expect(validateFileSize(file4, maxSizeMB)).toBeTruthy();
    });

    it('should handle empty files', () => {
      const file = new File([], 'empty.txt');
      expect(validateFileSize(file, 10)).toBeNull();
    });

    it('should handle different size limits', () => {
      const smallFile = new File(['x'.repeat(100)], 'small.txt');
      const largeFile = new File(['x'.repeat(2000000)], 'large.txt');

      // Small limit (0.001MB = ~1048 bytes) - 100 bytes should pass, 2MB should fail
      expect(validateFileSize(smallFile, 0.001)).toBeNull();
      expect(validateFileSize(largeFile, 0.001)).toBeTruthy();

      // Large limit (10MB) - both should pass
      expect(validateFileSize(smallFile, 10)).toBeNull();
      expect(validateFileSize(largeFile, 10)).toBeNull();
    });
  });
});

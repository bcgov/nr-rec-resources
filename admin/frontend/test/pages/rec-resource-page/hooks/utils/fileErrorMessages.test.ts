import {
  formatDeleteError,
  formatUploadError,
} from '@/pages/rec-resource-page/hooks/utils/fileErrorMessages';
import { describe, expect, it } from 'vitest';

describe('fileErrorMessages', () => {
  describe('formatUploadError', () => {
    it('should format processing error correctly', () => {
      const errorInfo = {
        statusCode: 0,
        message: 'Image processing failed',
      };

      const result = formatUploadError('Image "test.jpg"', errorInfo, true);

      expect(result).toBe(
        'Failed to process Image "test.jpg": Image processing failed',
      );
    });

    it('should format upload error correctly', () => {
      const errorInfo = {
        statusCode: 500,
        message: 'Internal server error',
      };

      const result = formatUploadError('Image "test.jpg"', errorInfo, false);

      expect(result).toBe(
        '500 - Failed to upload Image "test.jpg": Internal server error. Please try again.',
      );
    });

    it('should format upload error with different status codes', () => {
      const errorInfo = {
        statusCode: 400,
        message: 'Bad request',
      };

      const result = formatUploadError('File "test.pdf"', errorInfo, false);

      expect(result).toBe(
        '400 - Failed to upload File "test.pdf": Bad request. Please try again.',
      );
    });

    it('should format upload error with different file labels', () => {
      const errorInfo = {
        statusCode: 413,
        message: 'File too large',
      };

      const result = formatUploadError(
        'Document "large.pdf"',
        errorInfo,
        false,
      );

      expect(result).toBe(
        '413 - Failed to upload Document "large.pdf": File too large. Please try again.',
      );
    });
  });

  describe('formatDeleteError', () => {
    it('should format delete error correctly', () => {
      const errorInfo = {
        statusCode: 500,
        message: 'Delete failed',
      };

      const result = formatDeleteError('test-image.jpg', errorInfo);

      expect(result).toBe(
        '500 - Failed to delete test-image.jpg: Delete failed. Please try again.',
      );
    });

    it('should format delete error with different status codes', () => {
      const errorInfo = {
        statusCode: 404,
        message: 'File not found',
      };

      const result = formatDeleteError('missing.pdf', errorInfo);

      expect(result).toBe(
        '404 - Failed to delete missing.pdf: File not found. Please try again.',
      );
    });

    it('should format delete error with different file names', () => {
      const errorInfo = {
        statusCode: 403,
        message: 'Permission denied',
      };

      const result = formatDeleteError('protected-document.pdf', errorInfo);

      expect(result).toBe(
        '403 - Failed to delete protected-document.pdf: Permission denied. Please try again.',
      );
    });
  });
});

import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

describe('FileValidationException', () => {
  describe('Constructor', () => {
    it('should create exception with custom message and status', () => {
      const exception = new FileValidationException(
        'Custom error message',
        HttpStatus.BAD_REQUEST,
      );

      expect(exception).toBeInstanceOf(FileValidationException);
      expect(exception.message).toBe('Custom error message');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.name).toBe('FileValidationException');
    });

    it('should default to BAD_REQUEST status', () => {
      const exception = new FileValidationException('Error message');

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Static factory methods', () => {
    it.each([
      [
        'invalidFileType',
        () =>
          FileValidationException.invalidFileType([
            'application/pdf',
            'image/jpeg',
          ]),
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        null, // Message contains allowed types, so we check with toContain instead
        ['File Type not allowed', 'application/pdf', 'image/jpeg'],
      ],
      [
        'fileRequired',
        () => FileValidationException.fileRequired(),
        HttpStatus.BAD_REQUEST,
        'File is required',
      ],
      [
        'fileBufferRequired',
        () => FileValidationException.fileBufferRequired(),
        HttpStatus.BAD_REQUEST,
        'File buffer is required',
      ],
      [
        'fileBufferEmpty',
        () => FileValidationException.fileBufferEmpty(),
        HttpStatus.BAD_REQUEST,
        'File buffer cannot be empty',
      ],
      [
        'fileNameRequired',
        () => FileValidationException.fileNameRequired(),
        HttpStatus.BAD_REQUEST,
        'File name is required',
      ],
      [
        'fileTypeRequired',
        () => FileValidationException.fileTypeRequired(),
        HttpStatus.BAD_REQUEST,
        'File type is required',
      ],
    ])(
      'should create %s exception',
      (_, factory, expectedStatus, expectedMessage, expectedContains?) => {
        const exception = factory();

        expect(exception).toBeInstanceOf(FileValidationException);
        expect(exception.getStatus()).toBe(expectedStatus);
        if (expectedMessage) {
          expect(exception.message).toBe(expectedMessage);
        }
        if (expectedContains) {
          for (const text of expectedContains) {
            expect(exception.message).toContain(text);
          }
        }
      },
    );

    it.each([
      [undefined, 'File too large'],
      [5000, 'File too large. Maximum size: 5000 bytes'],
    ])(
      'should create fileTooLarge exception with maxSize: %s',
      (maxSize, expectedMessage) => {
        const exception = FileValidationException.fileTooLarge(maxSize);

        expect(exception).toBeInstanceOf(FileValidationException);
        expect(exception.getStatus()).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(exception.message).toBe(expectedMessage);
      },
    );
  });
});

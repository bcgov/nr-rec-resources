import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import { createFileValidationPipe } from '@/common/pipes/file-validation.pipe';
import { describe, expect, it } from 'vitest';
import { createMockFile } from '../../test-utils/file-test-utils';

describe('createFileValidationPipe', () => {
  describe('MIME type validation', () => {
    it('should accept valid MIME type', async () => {
      const pipe = createFileValidationPipe({
        allowedTypes: ['application/pdf'],
      });
      const file = createMockFile({ mimetype: 'application/pdf' });
      const result = await pipe.transform(file);
      expect(result).toBe(file);
    });

    it.each([
      ['image/jpeg', 'application/pdf'],
      ['text/plain', 'application/pdf'],
    ])(
      'should reject invalid MIME type: %s',
      async (invalidType, allowedType) => {
        const pipe = createFileValidationPipe({
          allowedTypes: [allowedType],
        });
        const file = createMockFile({ mimetype: invalidType });
        await expect(pipe.transform(file)).rejects.toThrow(
          FileValidationException,
        );
      },
    );

    it('should accept multiple allowed MIME types', async () => {
      const pipe = createFileValidationPipe({
        allowedTypes: ['application/pdf', 'image/jpeg'],
      });
      const files = [
        createMockFile({ mimetype: 'application/pdf' }),
        createMockFile({ mimetype: 'image/jpeg' }),
      ];

      for (const file of files) {
        await expect(pipe.transform(file)).resolves.toBe(file);
      }
    });
  });

  describe('File size validation', () => {
    it('should accept file within size limit', async () => {
      const pipe = createFileValidationPipe({
        allowedTypes: ['application/pdf'],
        maxSize: 5000,
      });
      const file = createMockFile({ mimetype: 'application/pdf', size: 3000 });
      await expect(pipe.transform(file)).resolves.toBe(file);
    });

    it('should reject file exceeding size limit', async () => {
      const pipe = createFileValidationPipe({
        allowedTypes: ['application/pdf'],
        maxSize: 1000,
      });
      const file = createMockFile({ mimetype: 'application/pdf', size: 2000 });
      await expect(pipe.transform(file)).rejects.toThrow(
        FileValidationException,
      );
    });
  });

  describe('Required file validation', () => {
    it.each([
      [true, 'rejects'],
      [undefined, 'rejects'], // default to true
    ])(
      'should reject when file is missing and required is %s',
      async (required, _) => {
        const pipe = createFileValidationPipe({
          allowedTypes: ['application/pdf'],
          ...(required !== undefined && { required }),
        });
        await expect(pipe.transform(undefined as any)).rejects.toThrow(
          FileValidationException,
        );
      },
    );

    it('should accept undefined when required is false', async () => {
      const pipe = createFileValidationPipe({
        allowedTypes: ['application/pdf'],
        required: false,
      });
      await expect(pipe.transform(undefined as any)).resolves.toBeUndefined();
    });
  });
});

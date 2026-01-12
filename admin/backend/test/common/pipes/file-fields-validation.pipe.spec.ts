import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import { createFileFieldsValidationPipe } from '@/common/pipes/file-fields-validation.pipe';
import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  assertFileValidationExceptionStatus,
  createMockFile,
} from '../../test-utils/file-test-utils';

describe('FileFieldsValidationPipe', () => {
  const createPipeWithFields = (fields: any[]) =>
    createFileFieldsValidationPipe({ fields });

  describe('Valid file uploads', () => {
    it('should accept all required fields with valid files', () => {
      const pipe = createPipeWithFields([
        { fieldName: 'original', allowedTypes: ['image/webp'] },
        { fieldName: 'scr', allowedTypes: ['image/webp'] },
        { fieldName: 'pre', allowedTypes: ['image/webp'] },
        { fieldName: 'thm', allowedTypes: ['image/webp'] },
      ]);

      const files = {
        original: [
          createMockFile({ fieldname: 'original', mimetype: 'image/webp' }),
        ],
        scr: [createMockFile({ fieldname: 'scr', mimetype: 'image/webp' })],
        pre: [createMockFile({ fieldname: 'pre', mimetype: 'image/webp' })],
        thm: [createMockFile({ fieldname: 'thm', mimetype: 'image/webp' })],
      };

      const result = pipe.transform(files, {} as any);
      expect(result).toBe(files);
    });

    it.each([
      ['application/pdf', 'document'],
      ['image/webp', 'image'],
    ])(
      'should accept files with correct MIME type: %s',
      (mimetype, fieldName) => {
        const pipe = createPipeWithFields([
          { fieldName, allowedTypes: [mimetype] },
        ]);

        const files = {
          [fieldName]: [createMockFile({ fieldname: fieldName, mimetype })],
        };

        const result = pipe.transform(files, {} as any);
        expect(result).toBe(files);
      },
    );

    it('should accept files under size limit', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'image',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
        ],
      });

      const files = {
        image: [
          createMockFile({
            fieldname: 'image',
            mimetype: 'image/webp',
            size: 1024 * 1024,
          }),
        ],
      };

      const result = pipe.transform(files, {} as any);
      expect(result).toBe(files);
    });

    it('should accept optional fields when not provided', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          { fieldName: 'required', allowedTypes: ['image/webp'] },
          {
            fieldName: 'optional',
            allowedTypes: ['image/webp'],
            required: false,
          },
        ],
      });

      const files = {
        required: [
          createMockFile({ fieldname: 'required', mimetype: 'image/webp' }),
        ],
      };

      const result = pipe.transform(files, {} as any);
      expect(result).toBe(files);
    });
  });

  describe('Missing required fields', () => {
    it.each([
      [
        'required field is missing',
        { fields: [{ fieldName: 'original' }, { fieldName: 'scr' }] },
        { original: [createMockFile({ fieldname: 'original' })] },
      ],
      [
        'files object is undefined',
        { fields: [{ fieldName: 'file' }] },
        undefined,
      ],
      [
        'field array is empty',
        { fields: [{ fieldName: 'file' }] },
        { file: [] },
      ],
    ])('should throw when %s', (_, config, files) => {
      const pipe = createPipeWithFields(
        config.fields.map((f: any) => ({
          ...f,
          allowedTypes: ['image/webp'],
        })),
      );

      expect(() => pipe.transform(files as any, {} as any)).toThrow(
        FileValidationException,
      );
    });

    it('should list all missing required fields', () => {
      const pipe = createPipeWithFields([
        { fieldName: 'field1', allowedTypes: ['image/webp'] },
        { fieldName: 'field2', allowedTypes: ['image/webp'] },
        { fieldName: 'field3', allowedTypes: ['image/webp'] },
      ]);

      expect(() => pipe.transform(undefined, {} as any)).toThrow(
        FileValidationException,
      );
    });
  });

  describe('Invalid MIME types', () => {
    it('should throw 415 for wrong MIME type', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [{ fieldName: 'image', allowedTypes: ['image/webp'] }],
      });

      const files = {
        image: [createMockFile({ fieldname: 'image', mimetype: 'image/jpeg' })],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        assertFileValidationExceptionStatus(
          error,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
        expect(error.message).toContain('image/webp');
        expect(error.message).toContain('image/jpeg');
      }
    });

    it('should provide descriptive error message with field name', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [{ fieldName: 'thumbnail', allowedTypes: ['image/webp'] }],
      });

      const files = {
        thumbnail: [
          createMockFile({ fieldname: 'thumbnail', mimetype: 'image/png' }),
        ],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain("File field 'thumbnail'");
        expect(error.message).toContain('Received: image/png');
      }
    });

    it('should accept multiple allowed MIME types', () => {
      const pipe = createPipeWithFields([
        {
          fieldName: 'document',
          allowedTypes: ['application/pdf', 'application/msword'],
        },
      ]);

      const testFiles = [
        { mimetype: 'application/pdf' },
        { mimetype: 'application/msword' },
      ];

      for (const fileConfig of testFiles) {
        const files = {
          document: [
            createMockFile({
              fieldname: 'document',
              mimetype: fileConfig.mimetype,
            }),
          ],
        };
        expect(() => pipe.transform(files, {} as any)).not.toThrow();
      }
    });

    it('should throw when file has no MIME type', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [{ fieldName: 'file', allowedTypes: ['image/webp'] }],
      });

      const files = {
        file: [createMockFile({ fieldname: 'file', mimetype: '' })],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        assertFileValidationExceptionStatus(error, HttpStatus.BAD_REQUEST);
        expect(error.message).toContain('has no MIME type');
      }
    });
  });

  describe('File size validation', () => {
    it('should throw 413 when file exceeds max size', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'image',
            allowedTypes: ['image/webp'],
            maxSize: 1024,
          },
        ],
      });

      const files = {
        image: [
          createMockFile({
            fieldname: 'image',
            mimetype: 'image/webp',
            size: 2048,
          }),
        ],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        assertFileValidationExceptionStatus(
          error,
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
        expect(error.message).toContain('exceeds maximum size');
      }
    });

    it('should include size information in error message', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'document',
            allowedTypes: ['application/pdf'],
            maxSize: 1024 * 1024,
          },
        ],
      });

      const files = {
        document: [
          createMockFile({
            fieldname: 'document',
            mimetype: 'application/pdf',
            size: 2 * 1024 * 1024,
          }),
        ],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('1.00MB');
        expect(error.message).toContain('2.00MB');
      }
    });

    it('should accept file exactly at max size', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'file',
            allowedTypes: ['image/webp'],
            maxSize: 1024,
          },
        ],
      });

      const files = {
        file: [
          createMockFile({
            fieldname: 'file',
            mimetype: 'image/webp',
            size: 1024,
          }),
        ],
      };

      expect(() => pipe.transform(files, {} as any)).not.toThrow();
    });
  });

  describe('Multiple fields validation', () => {
    it('should validate all fields independently', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'original',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
          {
            fieldName: 'scr',
            allowedTypes: ['image/webp'],
            maxSize: 1 * 1024 * 1024,
          },
          {
            fieldName: 'pre',
            allowedTypes: ['image/webp'],
            maxSize: 512 * 1024,
          },
          {
            fieldName: 'thm',
            allowedTypes: ['image/webp'],
            maxSize: 256 * 1024,
          },
        ],
      });

      const files = {
        original: [
          createMockFile({
            fieldname: 'original',
            mimetype: 'image/webp',
            size: 1024 * 1024,
          }),
        ],
        scr: [
          createMockFile({
            fieldname: 'scr',
            mimetype: 'image/webp',
            size: 512 * 1024,
          }),
        ],
        pre: [
          createMockFile({
            fieldname: 'pre',
            mimetype: 'image/webp',
            size: 256 * 1024,
          }),
        ],
        thm: [
          createMockFile({
            fieldname: 'thm',
            mimetype: 'image/webp',
            size: 128 * 1024,
          }),
        ],
      };

      expect(() => pipe.transform(files, {} as any)).not.toThrow();
    });

    it('should fail on first invalid field', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [
          { fieldName: 'field1', allowedTypes: ['image/webp'] },
          { fieldName: 'field2', allowedTypes: ['image/webp'] },
        ],
      });

      const files = {
        field1: [
          createMockFile({ fieldname: 'field1', mimetype: 'image/jpeg' }),
        ],
        field2: [
          createMockFile({ fieldname: 'field2', mimetype: 'image/webp' }),
        ],
      };

      try {
        pipe.transform(files, {} as any);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain("File field 'field1'");
      }
    });
  });

  describe('Edge cases', () => {
    it.each([
      ['empty files object', {}],
      ['undefined files', undefined],
    ])('should handle %s when all fields are optional', (_, files) => {
      const pipe = createPipeWithFields([
        {
          fieldName: 'optional',
          allowedTypes: ['image/webp'],
          required: false,
        },
      ]);

      const result = pipe.transform(files as any, {} as any);
      expect(result).toEqual({});
    });

    it('should work with no size limit specified', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [{ fieldName: 'file', allowedTypes: ['image/webp'] }],
      });

      const files = {
        file: [
          createMockFile({
            fieldname: 'file',
            mimetype: 'image/webp',
            size: 10 * 1024 * 1024,
          }),
        ],
      };

      expect(() => pipe.transform(files, {} as any)).not.toThrow();
    });

    it('should work with empty allowed types array', () => {
      const pipe = createFileFieldsValidationPipe({
        fields: [{ fieldName: 'file', allowedTypes: [] }],
      });

      const files = {
        file: [createMockFile({ fieldname: 'file', mimetype: 'any/type' })],
      };

      expect(() => pipe.transform(files, {} as any)).not.toThrow();
    });
  });
});

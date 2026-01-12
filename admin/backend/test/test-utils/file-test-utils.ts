import { FileValidationException } from '@/common/exceptions/file-validation.exception';
import { HttpStatus } from '@nestjs/common';
import { Readable } from 'stream';
import { expect } from 'vitest';

export interface CreateMockFileOptions {
  fieldname?: string;
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer | null;
  path?: string;
  encoding?: string;
  stream?: Readable | null;
}

export function createMockFile(
  options: CreateMockFileOptions | string = {},
): Express.Multer.File {
  const opts: CreateMockFileOptions =
    typeof options === 'string' ? { originalname: options } : options;

  const {
    fieldname = 'file',
    originalname = 'test.pdf',
    mimetype = 'application/pdf',
    size,
    path = '',
    encoding = '7bit',
    stream,
    buffer: providedBuffer,
  } = opts;

  const hasBufferKey = 'buffer' in opts;
  const buffer = hasBufferKey ? providedBuffer : Buffer.from('test content');
  const bufferSize = buffer ? buffer.length : 0;
  const defaultStream = Readable.from(['test content']);

  return {
    fieldname,
    originalname,
    encoding,
    mimetype,
    size: size ?? bufferSize,
    buffer: buffer as any,
    stream: stream !== undefined ? (stream as any) : defaultStream,
    destination: '',
    filename: '',
    path,
  };
}

export function createVariantFile(
  fieldname: string,
  mimetype: string = 'image/webp',
  originalname?: string,
): Express.Multer.File {
  return createMockFile({
    fieldname,
    originalname: originalname || `sample-${fieldname}.webp`,
    mimetype,
    buffer: Buffer.from(fieldname),
    size: 1024,
    path: fieldname,
    stream: Readable.from(['test']),
  });
}

export interface ImageVariantFiles {
  original: Express.Multer.File;
  scr: Express.Multer.File;
  pre: Express.Multer.File;
  thm: Express.Multer.File;
}

export function createVariantFiles(): ImageVariantFiles {
  return {
    original: createVariantFile('original'),
    scr: createVariantFile('scr'),
    pre: createVariantFile('pre'),
    thm: createVariantFile('thm'),
  };
}

export function assertFileValidationExceptionStatus(
  error: any,
  expectedStatus: HttpStatus,
): void {
  expect(error).toBeInstanceOf(FileValidationException);
  expect(error.getStatus()).toBe(expectedStatus);
}

export function assertFileValidationExceptionMessage(
  error: any,
  expectedMessage: string,
): void {
  expect(error).toBeInstanceOf(FileValidationException);
  expect(error.message).toContain(expectedMessage);
}

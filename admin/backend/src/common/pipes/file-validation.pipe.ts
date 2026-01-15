import {
  BadRequestException,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileValidationException } from '../exceptions/file-validation.exception';
import { createMimeTypeRegexPattern } from '../utils/file.utils';

/**
 * Options for single file validation pipe
 */
export interface FileValidationOptions {
  /**
   * Allowed MIME types
   */
  allowedTypes: string[];
  /**
   * Maximum file size in bytes (optional)
   */
  maxSize?: number;
  /**
   * Whether file is required (default: true)
   */
  required?: boolean;
}

/**
 * Creates a configured ParseFilePipe for single file validation
 * Validates MIME type and optionally file size
 *
 * @param options - File validation options
 * @returns Configured ParseFilePipe instance
 */
export function createFileValidationPipe(
  options: FileValidationOptions,
): ParseFilePipe {
  const { allowedTypes, maxSize, required = true } = options;

  const pipeBuilder = new ParseFilePipeBuilder();

  // Add MIME type validator
  // FileTypeValidator accepts a regex pattern as string
  if (allowedTypes.length > 0) {
    const fileTypePattern = createMimeTypeRegexPattern(allowedTypes);
    pipeBuilder.addFileTypeValidator({
      fileType: fileTypePattern,
      // Fallback to mimetype when magic number detection fails (e.g., in tests)
      fallbackToMimetype: true,
    });
  }

  // Add file size validator if specified
  if (maxSize) {
    pipeBuilder.addMaxSizeValidator({ maxSize });
  }

  return pipeBuilder.build({
    fileIsRequired: required,
    exceptionFactory: (error) => {
      // Customize error messages and status codes using FileValidationException
      // FileTypeValidator error messages typically include "File type" or "file type"
      const errorLower = error.toLowerCase();
      if (
        errorLower.includes('file type') ||
        errorLower.includes('filetype') ||
        errorLower.includes('mime type') ||
        errorLower.includes('mimetype') ||
        errorLower.includes('file validation failed')
      ) {
        return FileValidationException.invalidFileType(allowedTypes);
      }
      // MaxFileSizeValidator error messages typically include "File size" or "too large"
      if (
        errorLower.includes('file size') ||
        errorLower.includes('filesize') ||
        errorLower.includes('too large') ||
        errorLower.includes('exceeds') ||
        errorLower.includes('maximum')
      ) {
        return FileValidationException.fileTooLarge(maxSize);
      }
      // Missing file error messages
      if (
        errorLower.includes('required') ||
        errorLower.includes('missing') ||
        errorLower.includes('file is required')
      ) {
        return FileValidationException.fileRequired();
      }
      return new BadRequestException(error);
    },
  });
}

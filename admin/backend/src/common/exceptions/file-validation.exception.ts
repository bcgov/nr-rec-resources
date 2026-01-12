import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for file validation errors
 * Provides more specific error handling for file-related validation failures
 */
export class FileValidationException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
    this.name = 'FileValidationException';
  }

  /**
   * Creates an exception for invalid file type
   */
  static invalidFileType(allowedTypes: string[]): FileValidationException {
    return new FileValidationException(
      `File Type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    );
  }

  /**
   * Creates an exception for missing file
   */
  static fileRequired(): FileValidationException {
    return new FileValidationException(
      'File is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Creates an exception for missing file buffer
   */
  static fileBufferRequired(): FileValidationException {
    return new FileValidationException(
      'File buffer is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Creates an exception for empty file buffer
   */
  static fileBufferEmpty(): FileValidationException {
    return new FileValidationException(
      'File buffer cannot be empty',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Creates an exception for missing file name
   */
  static fileNameRequired(): FileValidationException {
    return new FileValidationException(
      'File name is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Creates an exception for missing MIME type
   */
  static fileTypeRequired(): FileValidationException {
    return new FileValidationException(
      'File type is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Creates an exception for file size exceeding maximum
   */
  static fileTooLarge(maxSize?: number): FileValidationException {
    const message = maxSize
      ? `File too large. Maximum size: ${maxSize} bytes`
      : 'File too large';
    return new FileValidationException(message, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

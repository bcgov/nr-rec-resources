import { HttpStatus } from '@nestjs/common';
import path from 'path';
import { FileValidationException } from '../exceptions/file-validation.exception';

// ============================================================================
// EXTRACTION UTILITIES
// ============================================================================

/**
 * Validate that originalname is a valid string
 * @internal
 */
function validateOriginalname(
  originalname: unknown,
): asserts originalname is string {
  if (!originalname || typeof originalname !== 'string') {
    throw new Error(
      `Invalid originalname: expected string, got ${typeof originalname}`,
    );
  }
}

/**
 * Extract filename without extension from original filename
 * Validates input and ensures a string is always returned
 * Handles both Unix and Windows path separators
 *
 * @param originalname - Original filename
 * @returns Filename without extension
 */
export function extractFilenameWithoutExtension(originalname: string): string {
  validateOriginalname(originalname);
  // Normalize Windows backslashes to forward slashes for cross-platform consistency
  const normalized = originalname.replace(/\\/g, '/');
  return path.basename(normalized, path.extname(normalized));
}

/**
 * Extract file extension from original filename (without the dot)
 * Validates input and ensures a string is always returned
 *
 * @param originalname - Original filename
 * @returns File extension without the dot
 */
export function extractExtension(originalname: string): string {
  validateOriginalname(originalname);
  return path.extname(originalname).replace('.', '');
}

/**
 * Extract and validate filename and extension from a file
 * Returns both values with validation
 *
 * @param file - Express Multer file object
 * @returns Object containing filename and extension
 */
export function extractFileMetadata(file: Express.Multer.File): {
  filename: string;
  extension: string;
} {
  validateOriginalname(file.originalname);
  return {
    filename: extractFilenameWithoutExtension(file.originalname),
    extension: extractExtension(file.originalname),
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates MIME type against allowed types
 * @param mimetype - The MIME type to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param fieldName - Optional field name for error messages (used in multi-field scenarios)
 * @throws FileValidationException if MIME type is not allowed
 */
export function validateMimeType(
  mimetype: string | undefined,
  allowedTypes: string[],
  fieldName?: string,
): void {
  if (!mimetype) {
    const message = fieldName
      ? `File field '${fieldName}' has no MIME type`
      : 'File has no MIME type';
    throw new FileValidationException(message, HttpStatus.BAD_REQUEST);
  }

  const isAllowed = allowedTypes.some((allowedType) => {
    // Escape special regex characters and create pattern
    const escapedType = allowedType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escapedType}$`, 'i');
    return pattern.test(mimetype);
  });

  if (!isAllowed) {
    const message = fieldName
      ? `File field '${fieldName}' must be one of: ${allowedTypes.join(', ')}. Received: ${mimetype}`
      : `File Type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    throw new FileValidationException(
      message,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    );
  }
}

/**
 * Validates file size against maximum allowed size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @param fieldName - Optional field name for error messages (used in multi-field scenarios)
 * @throws FileValidationException if file exceeds maximum size
 */
export function validateFileSize(
  size: number,
  maxSize: number,
  fieldName?: string,
): void {
  if (size > maxSize) {
    const maxSizeMB = formatFileSize(maxSize);
    const fileSizeMB = formatFileSize(size);
    const message = fieldName
      ? `File field '${fieldName}' exceeds maximum size of ${maxSizeMB} (received: ${fileSizeMB})`
      : `File exceeds maximum size of ${maxSizeMB} (received: ${fileSizeMB})`;
    throw new FileValidationException(message, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

/**
 * Validate file presence and required properties
 *
 * @param file - File to validate
 * @throws FileValidationException if file or required properties are missing
 */
export function validateFileRequired(
  file: Express.Multer.File | undefined,
): void {
  if (!file) {
    throw FileValidationException.fileRequired();
  }

  if (file.buffer === undefined || file.buffer === null) {
    throw FileValidationException.fileBufferRequired();
  }

  if (!file.originalname) {
    throw FileValidationException.fileNameRequired();
  }
}

/**
 * Validate file buffer exists and is not empty
 *
 * @param file - File to validate
 * @throws FileValidationException if buffer is missing or empty
 */
export function validateFileBuffer(
  file: Express.Multer.File | undefined,
): void {
  if (
    !file ||
    file.buffer === undefined ||
    file.buffer === null ||
    file.buffer.length === 0
  ) {
    throw FileValidationException.fileBufferEmpty();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format file size in bytes to human-readable string (MB)
 * @param size - File size in bytes
 * @returns Formatted size string (e.g., "2.00MB")
 */
export function formatFileSize(size: number): string {
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  return `${sizeMB}MB`;
}

/**
 * Escapes special regex characters in MIME types for use in regex patterns
 * Used by ParseFilePipeBuilder which requires regex pattern strings
 * @param types - Array of MIME types to escape
 * @returns Regex pattern string for use with FileTypeValidator
 */
export function createMimeTypeRegexPattern(types: string[]): string {
  if (types.length === 0) {
    return '';
  }
  const escapedTypes = types.map((type) =>
    type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  return `(${escapedTypes.join('|')})`;
}

import { ArgumentMetadata, HttpStatus, PipeTransform } from '@nestjs/common';
import { FileValidationException } from '../exceptions/file-validation.exception';
import { validateFileSize, validateMimeType } from '../utils/file.utils';

/**
 * Configuration for a single file field in file fields upload
 */
export interface FileFieldConfig {
  /** Name of the file field (e.g., 'original', 'scr', 'pre', 'thm') */
  fieldName: string;
  /** Allowed MIME types for this field */
  allowedTypes: string[];
  /** Maximum file size in bytes (optional) */
  maxSize?: number;
  /** Whether this field is required (default: true) */
  required?: boolean;
}

/**
 * Configuration for file fields validation pipe
 */
export interface FileFieldsValidationOptions {
  /** Array of field configurations */
  fields: FileFieldConfig[];
}

/**
 * Type for FileFieldsInterceptor output structure
 */
export type FileFieldsObject = {
  [fieldName: string]: Express.Multer.File[] | undefined;
};

/**
 * Custom pipe for validating multiple file fields from FileFieldsInterceptor
 * Validates each field's presence, MIME type, and size constraints
 */
export class FileFieldsValidationPipe implements PipeTransform {
  constructor(private readonly options: FileFieldsValidationOptions) {}

  transform(
    files: FileFieldsObject | undefined,
    _metadata: ArgumentMetadata,
  ): FileFieldsObject {
    if (!files) {
      // Check if any fields are required
      const requiredFields = this.options.fields.filter(
        (field) => field.required !== false,
      );
      if (requiredFields.length > 0) {
        const fieldNames = requiredFields.map((f) => f.fieldName).join(', ');
        throw new FileValidationException(
          `Required file fields are missing: ${fieldNames}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return {};
    }

    // Validate each configured field
    for (const fieldConfig of this.options.fields) {
      this.validateField(files, fieldConfig);
    }

    return files;
  }

  private validateField(
    files: FileFieldsObject,
    fieldConfig: FileFieldConfig,
  ): void {
    const { fieldName, allowedTypes, maxSize, required = true } = fieldConfig;
    const fileArray = files[fieldName];

    // Check if field is present
    if (!fileArray || fileArray.length === 0) {
      if (required) {
        throw new FileValidationException(
          `File field '${fieldName}' is required`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return; // Optional field not provided
    }

    // Get the first file (FileFieldsInterceptor typically has maxCount: 1 per field)
    const file = fileArray[0];

    if (!file) {
      if (required) {
        throw new FileValidationException(
          `File field '${fieldName}' is required`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    }

    // Validate MIME type using shared utility
    if (allowedTypes.length > 0) {
      validateMimeType(file.mimetype, allowedTypes, fieldName);
    }

    // Validate file size using shared utility
    if (maxSize !== undefined) {
      validateFileSize(file.size, maxSize, fieldName);
    }
  }
}

/**
 * Factory function to create a configured file fields validation pipe
 * Provides a consistent API with createFileValidationPipe
 *
 * @param options - Configuration for file fields validation
 * @returns Configured FileFieldsValidationPipe instance
 */
export function createFileFieldsValidationPipe(
  options: FileFieldsValidationOptions,
): FileFieldsValidationPipe {
  return new FileFieldsValidationPipe(options);
}

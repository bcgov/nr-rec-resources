import { z } from 'zod';
import { FileType } from '../types';

/**
 * Base schema for validating file upload names
 */
const baseFileUploadSchema = z.object({
  fileName: z
    .string()
    .min(1, 'File name is required')
    .max(100, 'File name cannot exceed 100 characters')
    .refine(
      (name) => /^[a-zA-Z0-9\s\-_.()]+$/.test(name),
      'File name contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, periods, and parentheses are allowed',
    ),
});

/**
 * Schema for validating file upload names and files
 */
export const fileUploadSchema = baseFileUploadSchema.extend({
  file: z.custom<File>(),
});

export type FileUploadSchema = z.infer<typeof fileUploadSchema>;

/**
 * Custom validation function that checks for duplicate names and validates file
 * Optimized version using Set for O(1) lookup instead of O(n) array search
 */
export const createFileUploadValidator = (
  existingFileNames: string[],
  _fileType: FileType,
) => {
  // Create a Set of normalized names for faster duplicate checking
  const normalizedExistingNames = new Set(
    existingFileNames.map((name) => name.toLowerCase().trim()),
  );

  return baseFileUploadSchema.extend({
    fileName: baseFileUploadSchema.shape.fileName.refine((name) => {
      const normalizedName = name.toLowerCase();
      return !normalizedExistingNames.has(normalizedName);
    }, 'A file with this name already exists. Please choose a different name'),
  });
};

import { FileType } from './types';

/**
 * Maximum file size limits in megabytes for different file types.
 */
export const MAX_FILE_SIZE_MB = {
  image: 25,
  document: 25,
} as const;

/**
 * File type configurations for different upload types.
 *
 * This configuration defines the accepted MIME types and limits for each file type
 * supported by the application.
 */
export const FILE_TYPE_CONFIGS: Record<
  FileType,
  { accept: string; maxFiles: number }
> = {
  document: {
    accept: 'application/pdf',
    maxFiles: 30,
  },
  image: {
    accept: 'image/png,image/jpg,image/jpeg,image/webp',
    maxFiles: 20,
  },
} as const;

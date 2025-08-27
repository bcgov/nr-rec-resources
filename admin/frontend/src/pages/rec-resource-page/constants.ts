import { FileType } from "./types";

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
    accept: "application/pdf",
    maxFiles: 30,
  },
  image: {
    accept: "image/png,image/jpg,image/jpeg,image/webp",
    maxFiles: 20,
  },
} as const;

export const MAX_FILE_SIZE_MB = 9.5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 9.5MB in bytes

/**
 * Returns true if the file exceeds the configured max size.
 */
export function isFileTooLarge(file: File): boolean {
  return file.size > MAX_FILE_SIZE_BYTES;
}

/**
 * Builds the standard oversized file error message for a given file name.
 */
export function buildFileTooLargeMessage(fileName: string): string {
  return `Whoops, the file "${fileName}" is too big. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`;
}

/**
 * Returns true if the file exceeds the specified max size.
 * @param file - The file to check.
 * @param maxSizeBytes - Maximum file size in bytes.
 * @returns True if the file exceeds the max size, false otherwise.
 */
export function isFileTooLarge(file: File, maxSizeBytes: number): boolean {
  return file.size > maxSizeBytes;
}

/**
 * Converts megabytes to bytes.
 * @param megabytes - Size in megabytes.
 * @returns Size in bytes.
 */
export function megabytesToBytes(megabytes: number): number {
  return megabytes * 1024 * 1024;
}

/**
 * Builds a file size error message for a given file name and max size.
 * @param fileName - The name of the file that's too large.
 * @param maxSizeMB - Maximum allowed file size in megabytes.
 * @returns Error message string.
 */
export function buildFileTooLargeMessage(
  fileName: string,
  maxSizeMB: number,
): string {
  return `Whoops, the file "${fileName}" is too big. Please upload a file smaller than ${maxSizeMB}MB.`;
}

/**
 * Validates file size and returns an error message if invalid, null if valid.
 * @param file - The file to validate.
 * @param maxSizeMB - Maximum allowed file size in megabytes.
 * @param fileName - Optional file name to include in error message. Defaults to file.name.
 * @returns Error message string if file is too large, null otherwise.
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number,
  fileName?: string,
): string | null {
  const maxSizeBytes = megabytesToBytes(maxSizeMB);
  if (isFileTooLarge(file, maxSizeBytes)) {
    return buildFileTooLargeMessage(fileName || file.name, maxSizeMB);
  }
  return null;
}

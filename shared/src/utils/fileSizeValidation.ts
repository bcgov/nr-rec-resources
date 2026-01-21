/** Returns true if the file exceeds the specified max size. */
export function isFileTooLarge(file: File, maxSizeBytes: number): boolean {
  return file.size > maxSizeBytes;
}

/** Converts megabytes to bytes using binary conversion (1024 base). */
export function megabytesToBytes(megabytes: number): number {
  return megabytes * 1024 * 1024;
}

/** 2% tolerance to account for decimal vs binary MB conversion differences. */
const FILE_SIZE_TOLERANCE_PERCENT = 0.02;

/** Builds a file size error message. */
export function buildFileTooLargeMessage(
  fileName: string,
  maxSizeMB: number,
): string {
  return `Whoops, the file "${fileName}" is too big. Please upload a file smaller than ${maxSizeMB}MB.`;
}

/**
 * Validates file size with 2% tolerance for decimal/binary conversion differences.
 * @returns Error message if too large, null if valid.
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number,
  fileName?: string,
): string | null {
  const maxSizeBytes = megabytesToBytes(maxSizeMB);
  // Add tolerance to account for decimal/binary conversion and file system overhead
  const maxSizeBytesWithTolerance =
    maxSizeBytes * (1 + FILE_SIZE_TOLERANCE_PERCENT);

  if (isFileTooLarge(file, maxSizeBytesWithTolerance)) {
    return buildFileTooLargeMessage(fileName || file.name, maxSizeMB);
  }
  return null;
}

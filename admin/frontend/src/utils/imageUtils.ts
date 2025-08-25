/**
 * Checks if a file is an image based on its extension.
 * @param file - The file to check.
 * @returns True if the file is an image, false otherwise.
 */
export function isImageFile(file: File): boolean {
  return /\.(jpg|jpeg|png|heic|webp|gif|bmp|tiff)$/i.test(file.name);
}

/**
 * Get a preview URL for a file (for previews).
 * Uses URL.createObjectURL for efficiency.
 */
export function getImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Validate image file size and type.
 */
export function validateImageFile(file: File, maxSizeMB = 10): string | null {
  if (!isImageFile(file)) return 'Invalid image file type.';
  if (file.size > maxSizeMB * 1024 * 1024)
    return `Image must be less than ${maxSizeMB}MB.`;
  return null;
}

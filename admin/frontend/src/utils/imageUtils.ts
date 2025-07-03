/**
 * Image-specific utility functions.
 */

/**
 * Check if a file is an image based on its extension or MIME type.
 */
export function isImageFile(file: File | string): boolean {
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tiff",
    "heic",
  ];
  if (typeof file === "string") {
    const ext = file.split(".").pop()?.toLowerCase();
    return !!ext && imageExtensions.includes(ext);
  }
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return !!ext && imageExtensions.includes(ext);
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
  if (!isImageFile(file)) return "Invalid image file type.";
  if (file.size > maxSizeMB * 1024 * 1024)
    return `Image must be less than ${maxSizeMB}MB.`;
  return null;
}

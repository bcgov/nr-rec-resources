/**
 * Downloads a Blob as a file in the browser.
 *
 * @param blob - The file content as a Blob.
 * @param fileName - The name for the downloaded file.
 */
export function downloadBlobAsFile(blob: Blob, fileName: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

/**
 * Downloads a file from a URL by fetching the content first.
 *
 * @param url - The direct URL to the file.
 * @param fileName - The name for the downloaded file.
 */
export async function downloadUrlAsFile(url: string, fileName: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  downloadBlobAsFile(blob, fileName);
}

/**
 * Triggers a file download in the browser for the given content.
 */
export function triggerFileDownload(
  content: string,
  fileName: string,
  mimeType: string,
) {
  try {
    const blob = new Blob([content], { type: mimeType });
    downloadBlobAsFile(blob, fileName);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

/**
 * Returns the file name without its extension.
 * @param file - The file to extract the name from.
 * @returns The file name without extension.
 */
export function getFileNameWithoutExtension(file: File): string {
  return file.name.replace(/\.[^/.]+$/, '');
}

/**
 * Builds a file name with the given extension, avoiding duplicate extensions.
 * @param title - The base file name.
 * @param extension - The file extension (without the dot).
 * @returns The file name with extension.
 */
export function buildFileNameWithExtension(
  title: string,
  extension: string,
): string {
  const lowerTitle = title.toLowerCase();
  const lowerExt = extension.toLowerCase();

  if (lowerTitle.endsWith(`.${lowerExt}`)) {
    // Replace the extension with lowercase version
    const lastDotIndex = title.lastIndexOf('.');
    return title.slice(0, lastDotIndex) + `.${lowerExt}`;
  }
  return `${title}.${extension}`;
}

/**
 * Validates if a file's MIME type matches any of the allowed MIME types.
 * Supports wildcard matching (e.g., "image/*" matches "image/jpeg", "image/png", etc.).
 *
 * @param file - The file to validate.
 * @param allowedMimeTypes - Comma-separated string of allowed MIME types (e.g., "image/png,image/jpeg,image/*").
 * @returns True if the file's MIME type matches one of the allowed types, false otherwise.
 */
export function validateFileMimeType(
  file: File,
  allowedMimeTypes: string,
): boolean {
  const allowedTypes = allowedMimeTypes.split(',');
  return allowedTypes.some((type) => {
    const normalizedType = type.trim().toLowerCase();
    const normalizedFileType = file.type.toLowerCase();
    // Handle wildcard matching (e.g., "image/*")
    if (normalizedType.endsWith('/*')) {
      const prefix = normalizedType.slice(0, -2);
      return normalizedFileType.startsWith(prefix);
    }
    return normalizedFileType === normalizedType;
  });
}

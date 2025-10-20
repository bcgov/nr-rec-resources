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
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  downloadBlobAsFile(blob, fileName);
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
  if (title.endsWith(`.${extension}`)) {
    return title;
  }
  return `${title}.${extension}`;
}

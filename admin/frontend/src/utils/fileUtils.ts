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
  const response = await fetch(url, { mode: 'cors' });
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

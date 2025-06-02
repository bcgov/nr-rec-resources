/**
 * Triggers a file download in the browser for the given content.
 *
 * @param content - The file content as a string.
 * @param fileName - The name for the downloaded file.
 * @param mimeType - The MIME type of the file.
 */
export function triggerFileDownload(
  content: string,
  fileName: string,
  mimeType: string,
) {
  try {
    const blob = new Blob([content], { type: mimeType });
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

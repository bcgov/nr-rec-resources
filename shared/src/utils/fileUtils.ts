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

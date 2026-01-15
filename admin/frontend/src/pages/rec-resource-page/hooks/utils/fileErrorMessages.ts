interface ApiErrorInfo {
  statusCode: number;
  message: string;
}

export function formatUploadError(
  fileLabel: string,
  errorInfo: ApiErrorInfo,
  isProcessingError: boolean,
): string {
  if (isProcessingError) {
    return `Failed to process ${fileLabel}: ${errorInfo.message}`;
  }
  return `${errorInfo.statusCode} - Failed to upload ${fileLabel}: ${errorInfo.message}. Please try again.`;
}

export function formatDeleteError(
  fileName: string,
  errorInfo: ApiErrorInfo,
): string {
  return `${errorInfo.statusCode} - Failed to delete ${fileName}: ${errorInfo.message}. Please try again.`;
}

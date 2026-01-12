import { vi } from 'vitest';

export const DEFAULT_ERROR_RESPONSE = {
  statusCode: 500,
  message: 'Error message',
  isResponseError: false,
  isAuthError: false,
};

export const DEFAULT_DELETE_ERROR_RESPONSE = {
  statusCode: 500,
  message: 'Delete failed',
  isResponseError: false,
  isAuthError: false,
};

export const DEFAULT_UPLOAD_ERROR_RESPONSE = {
  statusCode: 500,
  message: 'Upload failed',
  isResponseError: false,
  isAuthError: false,
};

export function createDefaultFormatUploadError() {
  return vi.fn(
    (fileLabel: string, errorInfo: { statusCode: number; message: string }) =>
      `${errorInfo.statusCode} - Failed to upload ${fileLabel}: ${errorInfo.message}. Please try again.`,
  );
}

export function createDefaultFormatDeleteError() {
  return vi.fn(
    (fileName: string, errorInfo: { statusCode: number; message: string }) =>
      `${errorInfo.statusCode} - Failed to delete ${fileName}: ${errorInfo.message}. Please try again.`,
  );
}

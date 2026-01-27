import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useMutation } from '@tanstack/react-query';

/**
 * Custom error class for S3 upload errors
 */
export class S3UploadError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'S3UploadError';
  }
}

/**
 * Result interface for S3 upload operations
 */
export interface S3UploadResult {
  /** S3 object key */
  key: string;
  /** ETag returned by S3 (unique identifier for the uploaded object) */
  etag?: string;
  /** HTTP status code from S3 */
  statusCode: number;
}

export interface S3UploadParams {
  presignedUrl: string;
  blob: Blob;
  contentType: string;
  s3Key: string;
}

/**
 * Hook for uploading files directly to S3 using presigned URLs
 * Uses TanStack Query mutation for consistent error handling and retry logic
 */
export function useS3Upload() {
  return useMutation<S3UploadResult, S3UploadError, S3UploadParams>({
    mutationFn: async ({ presignedUrl, blob, contentType, s3Key }) => {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!response.ok) {
        throw new S3UploadError(
          `S3 upload failed: ${response.statusText}`,
          response.status,
        );
      }

      return {
        key: s3Key,
        etag: response.headers.get('etag') || undefined,
        statusCode: response.status,
      };
    },
    retry: createRetryHandler({ maxRetries: 3 }),
  });
}

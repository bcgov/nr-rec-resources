import { useCallback } from 'react';
import {
  useFinalizeExhibitAUpload,
  usePresignExhibitAUpload,
} from '@/services/hooks/recreation-resource-admin/useExhibitADocsHooks';

export interface UploadExhibitAArgs {
  file: File;
  fileName: string;
  extension: string;
  applicationGuid: string;
  /** Only needed when the document belongs to a specific submission. */
  submissionId?: string;
}

/**
 * The three-step Exhibit A upload: presign, PUT to S3, finalize.
 * Throws on failure; callers decide how to notify and what to refresh.
 */
export const useExhibitAFileUpload = (recResourceId: string) => {
  const presignMutation = usePresignExhibitAUpload();
  const finalizeMutation = useFinalizeExhibitAUpload();

  const upload = useCallback(
    async ({
      file,
      fileName,
      extension,
      applicationGuid,
      submissionId,
    }: UploadExhibitAArgs) => {
      const presigned = await presignMutation.mutateAsync({
        recResourceId,
        fileName: `${fileName}.${extension}`,
        applicationGuid,
      });

      const s3Response = await fetch(presigned.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Response.ok) {
        throw new Error(
          `S3 upload failed: ${s3Response.status} ${s3Response.statusText}`,
        );
      }

      return finalizeMutation.mutateAsync({
        recResourceId,
        application_guid: applicationGuid,
        ...(submissionId ? { submission_id: submissionId } : {}),
        document_id: presigned.document_id,
        file_name: fileName,
        extension,
        file_size: file.size,
      });
    },
    [finalizeMutation, presignMutation, recResourceId],
  );

  return {
    upload,
    isPending: presignMutation.isPending || finalizeMutation.isPending,
  } as const;
};

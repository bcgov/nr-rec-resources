import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useMutation } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface PresignImageUploadParams {
  recResourceId: string;
  fileName: string;
}

export interface FinalizeImageUploadParams {
  recResourceId: string;
  image_id: string;
  file_name: string;
  file_size_original: number;
  file_size_scr: number;
  file_size_pre: number;
  file_size_thm: number;
}

export interface PresignDocUploadParams {
  recResourceId: string;
  fileName: string;
}

export interface FinalizeDocUploadParams {
  recResourceId: string;
  document_id: string;
  file_name: string;
  extension: string;
  file_size: number;
}

/**
 * Hook to request presigned URLs for image variant uploads
 * Returns image_id and presigned PUT URLs for 4 variants (original, scr, pre, thm)
 */
export function usePresignImageUpload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: PresignImageUploadParams) => {
      return apiClient.presignImageUpload(params);
    },
    retry: createRetryHandler(),
  });
}

/**
 * Hook to finalize image upload after S3 uploads complete
 * Creates database record with image metadata
 */
export function useFinalizeImageUpload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: FinalizeImageUploadParams) => {
      const { recResourceId, ...dto } = params;
      return apiClient.finalizeImageUpload({
        recResourceId,
        finalizeImageUploadRequestDto: dto,
      });
    },
    retry: createRetryHandler(),
  });
}

/**
 * Hook to request presigned URL for document upload
 * Returns document_id and presigned PUT URL
 */
export function usePresignDocUpload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: PresignDocUploadParams) => {
      return apiClient.presignDocUpload(params);
    },
    retry: createRetryHandler(),
  });
}

/**
 * Hook to finalize document upload after S3 upload completes
 * Creates database record with document metadata
 */
export function useFinalizeDocUpload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: FinalizeDocUploadParams) => {
      const { recResourceId, ...dto } = params;
      return apiClient.finalizeDocUpload({
        recResourceId,
        finalizeDocUploadRequestDto: dto,
      });
    },
    retry: createRetryHandler(),
  });
}

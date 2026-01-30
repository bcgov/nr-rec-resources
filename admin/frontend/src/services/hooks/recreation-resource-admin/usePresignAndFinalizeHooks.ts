import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useMutation } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface PresignImageUploadParams {
  recResourceId: string;
  fileName: string;
}

export interface ConsentFormParams {
  date_taken?: string;
  contains_pii?: boolean;
  photographer_type?: string;
  photographer_name?: string;
  consent_form?: File;
}

export interface FinalizeImageUploadParams {
  recResourceId: string;
  image_id: string;
  file_name: string;
  file_size_original: number;
  consent?: ConsentFormParams;
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
 * Creates database record with image metadata and optional consent form
 */
export function useFinalizeImageUpload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: async (params: FinalizeImageUploadParams) => {
      const { consent, ...rest } = params;

      return apiClient.finalizeImageUpload({
        recResourceId: rest.recResourceId,
        imageId: rest.image_id,
        fileName: rest.file_name,
        fileSizeOriginal: rest.file_size_original,
        consent: consent
          ? {
              date_taken: consent.date_taken,
              contains_pii: consent.contains_pii,
              photographer_type: consent.photographer_type,
              photographer_name: consent.photographer_name,
              consent_form: consent.consent_form,
            }
          : undefined,
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

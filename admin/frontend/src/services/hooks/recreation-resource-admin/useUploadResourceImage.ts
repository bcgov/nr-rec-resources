import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { ImageVariant } from '@/utils/imageProcessing';
import { useMutation } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface UploadResourceImageParams {
  recResourceId: string;
  variants: ImageVariant[];
  fileName: string;
  dateTaken?: string;
  containsPii?: boolean;
  photographerType?: string;
  photographerName?: string;
  consentFormFile?: File;
}

/**
 * Hook to upload an image with variants to a recreation resource.
 * Accepts 4 pre-processed WebP variants from browser-side processing.
 * Optionally accepts consent form metadata and PDF file.
 */
export function useUploadResourceImage() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: async ({
      recResourceId,
      variants,
      fileName,
      dateTaken,
      containsPii,
      photographerType,
      photographerName,
      consentFormFile,
    }: UploadResourceImageParams) => {
      // Extract variants into a map for easy lookup
      const variantMap = new Map(variants.map((v) => [v.sizeCode, v]));

      // Get each variant (required by API client)
      const original = variantMap.get('original');
      const scr = variantMap.get('scr');
      const pre = variantMap.get('pre');
      const thm = variantMap.get('thm');

      if (!original || !scr || !pre || !thm) {
        throw new Error('Missing required image variants');
      }

      const requestParams: Parameters<
        typeof apiClient.createRecreationresourceImage
      >[0] = {
        recResourceId,
        fileName,
        original: original.blob,
        scr: scr.blob,
        pre: pre.blob,
        thm: thm.blob,
      };

      const extendedParams = {
        ...requestParams,
        dateTaken,
        containsPii,
        photographerType,
        photographerName,
        consentForm: consentFormFile,
      };

      return await apiClient.createRecreationresourceImage(
        extendedParams as typeof requestParams,
      );
    },
    retry: createRetryHandler(),
  });
}

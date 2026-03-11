import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

// Creates consent metadata and uploads consent pdf if required
// for legacy images that don't yet have consent info.
export interface CreateImageConsentParams {
  recResourceId: string;
  imageId: string;
  fileName?: string;
  dateTaken?: string;
  containsPii?: boolean;
  photographerType?: string;
  photographerName?: string;
  consentForm?: File;
}

export function useCreateImageConsent() {
  const apiClient = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateImageConsentParams) =>
      apiClient.createImageConsent({
        recResourceId: params.recResourceId,
        imageId: params.imageId,
        fileName: params.fileName,
        dateTaken: params.dateTaken,
        containsPii: params.containsPii,
        photographerType: params.photographerType,
        photographerName: params.photographerName,
        consentForm: params.consentForm,
      }),
    retry: createRetryHandler(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.images(
          variables.recResourceId,
        ),
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

// Updates consent metadata on images that already have consent info.
export interface UpdateImageConsentParams {
  recResourceId: string;
  imageId: string;
  fileName?: string;
  dateTaken?: string;
}

export function useUpdateImageConsent() {
  const apiClient = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateImageConsentParams) =>
      apiClient.updateImageConsent({
        recResourceId: params.recResourceId,
        imageId: params.imageId,
        updateImageConsentDto: {
          file_name: params.fileName,
          date_taken: params.dateTaken,
        },
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

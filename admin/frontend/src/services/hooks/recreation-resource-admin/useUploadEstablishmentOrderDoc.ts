import { RecreationResourceApi } from '@/services/recreation-resource-admin';
import { useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface UploadEstablishmentOrderDocParams {
  recResourceId: string;
  file: File;
  title: string;
}

export function useUploadEstablishmentOrderDoc() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourceApi;

  return useMutation({
    mutationFn: async (params: UploadEstablishmentOrderDocParams) => {
      return api.establishmentOrderDocsControllerCreateV1(params);
    },
    retry: createRetryHandler(),
  });
}

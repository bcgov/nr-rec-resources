import { useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface UploadEstablishmentOrderDocParams {
  recResourceId: string;
  file: File;
  title: string;
}

export function useUploadEstablishmentOrderDoc() {
  const api = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: async (params: UploadEstablishmentOrderDocParams) => {
      return api.createEstablishmentOrderDoc(params);
    },
    retry: createRetryHandler(),
  });
}

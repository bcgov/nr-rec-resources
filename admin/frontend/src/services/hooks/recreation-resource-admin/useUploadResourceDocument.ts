import { RecreationResourcesApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface UploadResourceDocumentParams {
  recResourceId: string;
  fileName: string;
  file: File;
}

export function useUploadResourceDocument() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;

  return useMutation({
    mutationFn: async (params: UploadResourceDocumentParams) => {
      return api.createRecreationresourceDocument({
        recResourceId: params.recResourceId,
        fileName: params.fileName,
        file: params.file,
      });
    },
    retry: createRetryHandler(),
  });
}

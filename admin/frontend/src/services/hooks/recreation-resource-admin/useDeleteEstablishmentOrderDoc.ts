import { useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface DeleteEstablishmentOrderDocParams {
  recResourceId: string;
  s3Key: string;
}

export function useDeleteEstablishmentOrderDoc() {
  const api = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: DeleteEstablishmentOrderDocParams) => {
      return api.establishmentOrderDocsControllerDeleteV1(params);
    },
    retry: createRetryHandler(),
  });
}

import { useMutation } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface DeleteResourceImageParams {
  recResourceId: string;
  refId: string;
}

export function useDeleteResourceImage() {
  const api = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: (params: DeleteResourceImageParams) => {
      return api.deleteImageResource(params);
    },
    retry: createRetryHandler(),
  });
}

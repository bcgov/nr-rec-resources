import { DeleteImageResourceRequest } from '@/services/recreation-resource-admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export function useDeleteResourceImage() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteImageResourceRequest) => {
      return api.deleteImageResource({
        recResourceId: params.recResourceId,
        imageId: params.imageId,
      });
    },
    retry: createRetryHandler(),
    onSuccess: (_, variables) => {
      // Invalidate images query to refetch the updated list
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.images(
          variables.recResourceId,
        ),
      });
    },
  });
}

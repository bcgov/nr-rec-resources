import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export interface DeleteResourceDocumentParams {
  recResourceId: string;
  documentId: string;
}

export function useDeleteResourceDocument() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteResourceDocumentParams) => {
      return api.deleteDocumentResource({
        recResourceId: params.recResourceId,
        documentId: params.documentId,
      });
    },
    retry: createRetryHandler(),
    onSuccess: (_, variables) => {
      // Invalidate documents query to refetch the updated list
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.documents(
          variables.recResourceId,
        ),
      });
    },
  });
}

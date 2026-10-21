import {
  RecreationResourcesApi,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface ArchiveResouceRequest {
  recResourceId: string;
}

export function useArchiveRecResource() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<void, ResponseError, ArchiveResouceRequest>({
    mutationFn: async ({ recResourceId }) => {
      await api.archiveRecreationResourceById({
        recResourceId,
      });
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to archive resource after multiple attempts. Please try again later.',
          'updateActivities-error',
        ),
    }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.detail(variables.recResourceId),
        data,
      );
      // Also refetch to guarantee consistency with server-side transforms/normalization.
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(
          variables.recResourceId,
        ),
      });
    },
  });
}

import {
  RecreationActivityDto,
  RecreationResourcesApi,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface UpdateActivitiesRequest {
  recResourceId: string;
  activity_codes: number[];
}

export function useUpdateActivities() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<
    RecreationActivityDto[],
    ResponseError,
    UpdateActivitiesRequest
  >({
    mutationFn: async ({ recResourceId, activity_codes }) => {
      const response = await api.updateActivities({
        recResourceId,
        updateActivitiesDto: { activity_codes },
      });

      return response;
    },
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update activities after multiple attempts. Please try again later.',
          'updateActivities-error',
        ),
    }),
    onSuccess: (data, variables) => {
      // Update the query cache
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.activities(variables.recResourceId),
        data,
      );
      // Also invalidate the main resource query to refresh activities there
      queryClient.invalidateQueries({
        queryKey: ['recreation-resource', variables.recResourceId],
      });
    },
  });
}

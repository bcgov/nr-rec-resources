import {
  RecreationTrailDto,
  ResponseError,
  createRetryHandler,
  useRecreationResourceAdminApiClient,
} from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface DeleteTrailRequest {
  recResourceId: string;
  trailId: number;
}

export function useDeleteTrail() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation<void, ResponseError, DeleteTrailRequest>({
    mutationFn: ({ recResourceId, trailId }) =>
      api.deleteTrail({ recResourceId, trailId }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to delete trail after multiple attempts. Please try again later.',
          'deleteTrail-error',
        ),
    }),
    onSuccess: (_, variables) => {
      addSuccessNotification(
        'Trail deleted successfully',
        'deleteTrail-success',
      );
      queryClient.setQueryData<RecreationTrailDto[]>(
        RECREATION_RESOURCE_QUERY_KEYS.trails(variables.recResourceId),
        (old) =>
          old?.filter(
            (t) => t.recreation_activity_code_trails_id !== variables.trailId,
          ) ?? [],
      );
    },
    onError: () => {
      addErrorNotification('Failed to delete trail', 'deleteTrail-error');
    },
  });
}

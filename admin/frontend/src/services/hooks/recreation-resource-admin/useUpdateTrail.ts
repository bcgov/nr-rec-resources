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

export interface UpdateTrailRequest {
  recResourceId: string;
  trailId: number;
  trail_type?: string | null;
  name?: string;
  description?: string | null;
}

export function useUpdateTrail() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation<RecreationTrailDto, ResponseError, UpdateTrailRequest>({
    mutationFn: ({ recResourceId, trailId, ...updateTrailDto }) =>
      api.updateTrail({
        recResourceId,
        trailId,
        updateTrailDto: updateTrailDto as any,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to update trail after multiple attempts. Please try again later.',
          'updateTrail-error',
        ),
    }),
    onSuccess: (data, variables) => {
      addSuccessNotification(
        'Trail updated successfully',
        'updateTrail-success',
      );
      queryClient.setQueryData<RecreationTrailDto[]>(
        RECREATION_RESOURCE_QUERY_KEYS.trails(variables.recResourceId),
        (old) => {
          if (!old) return [data];
          const idx = old.findIndex(
            (t) =>
              t.recreation_activity_code_trails_id ===
              data.recreation_activity_code_trails_id,
          );
          if (idx === -1) return [...old, data];
          const next = [...old];
          next[idx] = data;
          return next;
        },
      );
    },
    onError: () => {
      addErrorNotification('Failed to update trail', 'updateTrail-error');
    },
  });
}

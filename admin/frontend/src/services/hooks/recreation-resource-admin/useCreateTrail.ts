import {
  RecreationResourcesApi,
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

export interface CreateTrailRequest {
  recResourceId: string;
  recreation_activity_code: number;
  trail_type?: string | null;
  name: string;
  description?: string;
}

export function useCreateTrail() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationTrailDto, ResponseError, CreateTrailRequest>({
    mutationFn: ({ recResourceId, ...createTrailDto }) =>
      api.createTrail({ recResourceId, createTrailDto: createTrailDto as any }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to create trail after multiple attempts. Please try again later.',
          'createTrail-error',
        ),
    }),
    onSuccess: (data, variables) => {
      addSuccessNotification(
        'Trail created successfully',
        'createTrail-success',
      );
      queryClient.setQueryData<RecreationTrailDto[]>(
        RECREATION_RESOURCE_QUERY_KEYS.trails(variables.recResourceId),
        (old) => (old ? [...old, data] : [data]),
      );
    },
    onError: () => {
      addErrorNotification('Failed to create trail', 'createTrail-error');
    },
  });
}

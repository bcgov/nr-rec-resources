import {
  RecreationNoteDto,
  RecreationResourcesApi,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export const useGetNotes = (
  recResourceId?: string,
  queryOptions: QueryOptions<RecreationNoteDto[], ResponseError> = {},
) => {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;

  return useQuery<RecreationNoteDto[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.notes(recResourceId!),
    initialData: [],
    queryFn: async () =>
      await (api as any).getRecreationResourceNotes({
        recResourceId: recResourceId!,
      }),
    enabled: Boolean(recResourceId),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to load notes after multiple attempts. Please try again later.',
          'getNotes-error',
        ),
    }),
    ...queryOptions,
  });
};

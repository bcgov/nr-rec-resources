import {
  mockNotesApi,
  RecreationResourceNoteUIModel,
} from '@/services/mocks/recreationResourceNotes';
import { ResponseError } from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryOptions, useQuery } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

// Reads from the in-memory mock until the notes endpoints exist. Everything
// else here matches useGetFees so the swap is a change to queryFn only.
export const useGetNotes = (
  recResourceId?: string,
  queryOptions: QueryOptions<
    RecreationResourceNoteUIModel[],
    ResponseError
  > = {},
) => {
  return useQuery<RecreationResourceNoteUIModel[], ResponseError>({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.notes(recResourceId!),
    initialData: [],
    queryFn: async () => mockNotesApi.list(recResourceId!),
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

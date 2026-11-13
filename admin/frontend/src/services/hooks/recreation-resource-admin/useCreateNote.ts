import {
  RecreationNoteDto,
  RecreationResourcesApi,
  ResponseError,
  useRecreationResourceAdminApiClient,
} from '@/services';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface CreateNoteRequest {
  recResourceId: string;
  title: string;
  body: string;
}

export function useCreateNote() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationNoteDto, ResponseError, CreateNoteRequest>({
    mutationFn: async ({ recResourceId, ...noteData }) =>
      await (api as any).createRecreationResourceNote({
        recResourceId,
        createRecreationNoteDto: noteData,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to save note after multiple attempts. Please try again later.',
          'createNote-error',
        ),
    }),
    onSuccess: (note, variables) => {
      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.notes(
        variables.recResourceId,
      );

      // Newest first, matching the order the list query returns.
      queryClient.setQueryData<RecreationNoteDto[] | undefined>(
        queryKey,
        (old) => (old ? [note, ...old] : [note]),
      );
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        addErrorNotification('Resource not found', 'createNote-notfound');
      }
    },
  });
}

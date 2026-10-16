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

export interface UpdateNoteRequest {
  recResourceId: string;
  noteId: string;
  title: string;
  body: string;
}

export function useUpdateNote() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationNoteDto, ResponseError, UpdateNoteRequest>({
    mutationFn: async ({ recResourceId, noteId, ...noteData }) =>
      await (api as any).updateRecreationResourceNote({
        recResourceId,
        noteId,
        updateRecreationNoteDto: noteData,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to save note after multiple attempts. Please try again later.',
          'updateNote-error',
        ),
    }),
    onSuccess: (note, variables) => {
      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.notes(
        variables.recResourceId,
      );

      queryClient.setQueryData<RecreationNoteDto[] | undefined>(
        queryKey,
        (old) =>
          old?.map((existing) =>
            existing.note_id === note.note_id ? note : existing,
          ) ?? [note],
      );
    },
    onError: (error) => {
      const statusCode = error.response?.status;
      if (statusCode === 403) {
        addErrorNotification(
          'Notes imported from FTA cannot be changed',
          'updateNote-locked',
        );
      } else if (statusCode === 404) {
        addErrorNotification('Note not found', 'updateNote-notfound');
      }
    },
  });
}

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

export interface DeleteNoteRequest {
  recResourceId: string;
  noteId: string;
}

export function useDeleteNote() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<RecreationNoteDto, ResponseError, DeleteNoteRequest>({
    mutationFn: async ({ recResourceId, noteId }) =>
      await (api as any).deleteRecreationResourceNote({
        recResourceId,
        noteId,
      }),
    retry: createRetryHandler({
      onFail: () =>
        addErrorNotification(
          'Failed to remove note after multiple attempts. Please try again later.',
          'deleteNote-error',
        ),
    }),
    onSuccess: (_, variables) => {
      const queryKey = RECREATION_RESOURCE_QUERY_KEYS.notes(
        variables.recResourceId,
      );

      queryClient.setQueryData<RecreationNoteDto[] | undefined>(
        queryKey,
        (old) => old?.filter((note) => note.note_id !== variables.noteId) ?? [],
      );
    },
    onError: (error) => {
      const statusCode = error.response?.status;
      if (statusCode === 403) {
        addErrorNotification(
          'Notes imported from FTA cannot be removed',
          'deleteNote-locked',
        );
      } else if (statusCode === 404) {
        addErrorNotification('Note not found', 'deleteNote-notfound');
      }
    },
  });
}

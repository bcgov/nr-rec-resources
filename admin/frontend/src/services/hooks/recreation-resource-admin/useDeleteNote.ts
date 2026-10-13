import { ResponseError } from '@/services';
import {
  mockNotesApi,
  RecreationResourceNoteUIModel,
} from '@/services/mocks/recreationResourceNotes';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface DeleteNoteRequest {
  recResourceId: string;
  noteId: string;
}

// Writes to the in-memory mock until the notes endpoints exist.
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<void, ResponseError, DeleteNoteRequest>({
    mutationFn: async ({ recResourceId, noteId }) =>
      mockNotesApi.remove(recResourceId, noteId),
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

      queryClient.setQueryData<RecreationResourceNoteUIModel[] | undefined>(
        queryKey,
        (old) => old?.filter((note) => note.note_id !== variables.noteId) ?? [],
      );
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        addErrorNotification('Note not found', 'deleteNote-notfound');
      }
    },
  });
}

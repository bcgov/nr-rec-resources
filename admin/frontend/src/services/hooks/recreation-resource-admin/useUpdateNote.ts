import { ResponseError } from '@/services';
import {
  mockNotesApi,
  RecreationResourceNoteUIModel,
  UpdateNotePayload,
} from '@/services/mocks/recreationResourceNotes';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface UpdateNoteRequest extends UpdateNotePayload {
  recResourceId: string;
  noteId: string;
}

// Writes to the in-memory mock until the notes endpoints exist.
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceNoteUIModel,
    ResponseError,
    UpdateNoteRequest
  >({
    mutationFn: async ({ recResourceId, noteId, ...payload }) =>
      mockNotesApi.update(recResourceId, noteId, payload),
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

      queryClient.setQueryData<RecreationResourceNoteUIModel[] | undefined>(
        queryKey,
        (old) =>
          old?.map((existing) =>
            existing.note_id === note.note_id ? note : existing,
          ) ?? [note],
      );
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        addErrorNotification('Note not found', 'updateNote-notfound');
      }
    },
  });
}

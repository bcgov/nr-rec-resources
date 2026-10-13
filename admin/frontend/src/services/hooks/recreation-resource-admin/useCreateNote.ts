import { ResponseError } from '@/services';
import {
  CreateNotePayload,
  mockNotesApi,
  RecreationResourceNoteUIModel,
} from '@/services/mocks/recreationResourceNotes';
import { addErrorNotification } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRetryHandler } from './helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface CreateNoteRequest extends CreateNotePayload {
  recResourceId: string;
}

// Writes to the in-memory mock until the notes endpoints exist.
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceNoteUIModel,
    ResponseError,
    CreateNoteRequest
  >({
    mutationFn: async ({ recResourceId, ...payload }) =>
      mockNotesApi.create(recResourceId, payload),
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
      queryClient.setQueryData<RecreationResourceNoteUIModel[] | undefined>(
        queryKey,
        (old) => (old ? [note, ...old] : [note]),
      );
    },
  });
}

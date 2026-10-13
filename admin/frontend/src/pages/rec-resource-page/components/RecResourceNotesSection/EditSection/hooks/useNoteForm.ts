import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useCreateNote,
  useUpdateNote,
} from '@/services/hooks/recreation-resource-admin';
import { RecreationResourceNoteUIModel } from '@/services/mocks/recreationResourceNotes';
import { addSuccessNotification } from '@/store/notificationStore';
import {
  NoteFormData,
  noteSchema,
} from '@/pages/rec-resource-page/components/RecResourceNotesSection/EditSection/schemas/note';

export type NoteFormMode = 'create' | 'edit';

export const useNoteForm = ({
  recResourceId,
  mode,
  initialNote,
  onDone,
}: {
  recResourceId: string;
  mode: NoteFormMode;
  initialNote?: RecreationResourceNoteUIModel;
  onDone?: () => void;
}) => {
  const { authService } = useAuthContext();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const mutation = mode === 'create' ? createNote : updateNote;

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialNote?.title ?? '',
      body: initialNote?.body ?? '',
    },
  });

  // Both are server-derived and shown disabled, so they're outside the form.
  const createdBy = initialNote?.created_by ?? authService.getUserFullName();
  const dateLogged =
    initialNote?.date_logged ?? new Date().toISOString().slice(0, 10);

  const onSubmit = handleSubmit(async (data) => {
    if (mode === 'create') {
      await createNote.mutateAsync({
        recResourceId,
        // Only plain notes can be created for now.
        note_type: 'NOTE',
        title: data.title,
        body: data.body,
        created_by: createdBy,
      });
      addSuccessNotification('Note saved successfully', 'createNote-success');
    } else {
      if (!initialNote) return;
      await updateNote.mutateAsync({
        recResourceId,
        noteId: initialNote.note_id,
        title: data.title,
        body: data.body,
      });
      addSuccessNotification('Note updated successfully', 'updateNote-success');
    }

    onDone?.();
  });

  return {
    control,
    register,
    errors,
    watch,
    onSubmit,
    mutation,
    createdBy,
    dateLogged,
    isSubmittable: isValid && !mutation.isPending,
  };
};

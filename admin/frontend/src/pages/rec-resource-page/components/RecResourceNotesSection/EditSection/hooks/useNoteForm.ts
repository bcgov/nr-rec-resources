import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useCreateNote,
  useUpdateNote,
} from '@/services/hooks/recreation-resource-admin';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
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
  initialNote?: RecreationNoteDto;
  onDone?: () => void;
}) => {
  const { user } = useAuthContext();
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

  // Both are stamped by the server and shown disabled, so they sit outside the
  // form. For a new note nothing is assigned yet, so preview the same values
  // the backend will write rather than leaving the fields blank.
  const createdBy =
    initialNote?.created_by ??
    (user?.idir_username ? `IDIR\\${user.idir_username}` : '');
  const dateLogged =
    initialNote?.date_logged ?? new Date().toISOString().slice(0, 10);

  const onSubmit = handleSubmit(async (data) => {
    if (mode === 'create') {
      await createNote.mutateAsync({
        recResourceId,
        title: data.title,
        body: data.body,
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

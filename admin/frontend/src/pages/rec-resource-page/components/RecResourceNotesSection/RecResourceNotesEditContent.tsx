import { useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { useDeleteNote } from '@/services/hooks/recreation-resource-admin/useDeleteNote';
import { RecreationResourceNoteUIModel } from '@/services/mocks/recreationResourceNotes';
import { addSuccessNotification } from '@/store/notificationStore';
import { NoteCard } from './NoteCard';
import { NotesEmptyState } from './NotesEmptyState';
import { NoteFormModal } from './EditSection';
import './RecResourceNotesSection.scss';

type RecResourceNotesEditContentProps = {
  notes: RecreationResourceNoteUIModel[];
  recResourceId: string;
  isArchived?: boolean;
};

export const RecResourceNotesEditContent = ({
  notes,
  recResourceId,
  isArchived,
}: RecResourceNotesEditContentProps) => {
  const navigate = useNavigate();
  const [notePendingRemoval, setNotePendingRemoval] =
    useState<RecreationResourceNoteUIModel | null>(null);
  const [noteBeingEdited, setNoteBeingEdited] =
    useState<RecreationResourceNoteUIModel | null>(null);
  const deleteNote = useDeleteNote();

  const viewPath = ROUTE_PATHS.REC_RESOURCE_NOTES.replace('$id', recResourceId);

  const handleRemove = async () => {
    if (!notePendingRemoval) return;

    await deleteNote.mutateAsync({
      recResourceId,
      noteId: notePendingRemoval.note_id,
    });

    setNotePendingRemoval(null);
    // Delete can be reached from inside the edit modal, so close that too.
    setNoteBeingEdited(null);
    addSuccessNotification('Note removed successfully', 'deleteNote-success');
  };

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Edit notes and references</h2>
        {/* Removes apply immediately and edits happen in a modal, so there is
            no draft state here and nothing to save. */}
        <Button
          variant="outline-primary"
          onClick={() => void navigate({ to: viewPath })}
        >
          Done
        </Button>
      </div>

      {notes.length === 0 ? (
        <NotesEmptyState />
      ) : (
        <Stack direction="vertical" gap={3}>
          {notes.map((note) => (
            <NoteCard
              key={note.note_id}
              note={note}
              isArchived={isArchived}
              onEdit={setNoteBeingEdited}
              onRemove={setNotePendingRemoval}
            />
          ))}
        </Stack>
      )}

      {noteBeingEdited && (
        <NoteFormModal
          recResourceId={recResourceId}
          mode="edit"
          initialNote={noteBeingEdited}
          onClose={() => setNoteBeingEdited(null)}
          onDelete={() => setNotePendingRemoval(noteBeingEdited)}
        />
      )}

      <DeleteConfirmationModal
        show={Boolean(notePendingRemoval)}
        title="Remove this note?"
        description="Removing this note will immediately take it off this recreation resource in RecSpace. This action cannot be undone."
        isDeleting={deleteNote.isPending}
        onCancel={() => setNotePendingRemoval(null)}
        onConfirm={handleRemove}
        confirmText="Remove"
        confirmVariant="outline-danger"
      />
    </Stack>
  );
};

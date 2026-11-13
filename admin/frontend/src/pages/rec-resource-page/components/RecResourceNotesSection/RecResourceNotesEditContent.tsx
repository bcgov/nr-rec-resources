import { useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { useDeleteNote } from '@/services/hooks/recreation-resource-admin/useDeleteNote';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import { addSuccessNotification } from '@/store/notificationStore';
import { NoteCard } from './NoteCard';
import { NotesEmptyState } from './NotesEmptyState';
import { NoteFormModal } from './EditSection';
import './RecResourceNotesSection.scss';

type RecResourceNotesEditContentProps = {
  notes: RecreationNoteDto[];
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
    useState<RecreationNoteDto | null>(null);
  const [noteBeingEdited, setNoteBeingEdited] =
    useState<RecreationNoteDto | null>(null);
  const deleteNote = useDeleteNote();

  const viewPath = ROUTE_PATHS.REC_RESOURCE_NOTES.replace('$id', recResourceId);

  const handleRemove = async () => {
    if (!notePendingRemoval) return;

    await deleteNote.mutateAsync({
      recResourceId,
      noteId: notePendingRemoval.note_id,
    });

    setNotePendingRemoval(null);
    // Delete is also reachable from inside the edit modal.
    setNoteBeingEdited(null);
    addSuccessNotification('Note removed successfully', 'deleteNote-success');
  };

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Edit notes and references</h2>
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
              // The API rejects changes to imported notes.
              onEdit={note.is_editable ? setNoteBeingEdited : undefined}
              onRemove={note.is_editable ? setNotePendingRemoval : undefined}
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

import { useState } from 'react';
import { Button, Dropdown, Spinner, Stack } from 'react-bootstrap';
import { EditableGuard } from '@/components/auth';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { useDeleteNote } from '@/services/hooks/recreation-resource-admin/useDeleteNote';
import {
  RecreationResourceNoteType,
  RecreationResourceNoteUIModel,
} from '@/services/mocks/recreationResourceNotes';
import { addSuccessNotification } from '@/store/notificationStore';
import { NoteCard } from './NoteCard';
import { ENABLED_NOTE_TYPES, NOTE_TYPE_LABELS } from './constants';
import './RecResourceNotesSection.scss';

type RecResourceNotesContentProps = {
  notes: RecreationResourceNoteUIModel[];
  recResourceId?: string;
  isArchived?: boolean;
  isLoading?: boolean;
};

export const RecResourceNotesContent = ({
  notes,
  recResourceId,
  isArchived,
  isLoading,
}: RecResourceNotesContentProps) => {
  const [notePendingRemoval, setNotePendingRemoval] =
    useState<RecreationResourceNoteUIModel | null>(null);
  const deleteNote = useDeleteNote();

  const handleRemove = async () => {
    if (!notePendingRemoval || !recResourceId) return;

    await deleteNote.mutateAsync({
      recResourceId,
      noteId: notePendingRemoval.note_id,
    });

    setNotePendingRemoval(null);
    addSuccessNotification('Note removed successfully', 'deleteNote-success');
  };

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Notes and references</h2>

        <EditableGuard isArchived={isArchived}>
          <Stack direction="horizontal" gap={2}>
            {/* Add and Edit open the create/edit modals, which land in the next stage. */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="notes-add-menu">
                Add
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {(
                  Object.keys(NOTE_TYPE_LABELS) as RecreationResourceNoteType[]
                ).map((noteType) => (
                  <Dropdown.Item key={noteType} disabled>
                    {NOTE_TYPE_LABELS[noteType]}
                    {!ENABLED_NOTE_TYPES.includes(noteType) &&
                      ' (not designed yet)'}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-primary" disabled>
              Edit
            </Button>
          </Stack>
        </EditableGuard>
      </div>

      {isLoading ? (
        <div className="rec-resource-page__loading-container">
          <Spinner
            animation="border"
            className="rec-resource-page__loading-spinner"
            role="status"
            aria-label="Loading notes"
          />
        </div>
      ) : notes.length === 0 ? (
        <div className="notes-empty-state bg-light p-3 rounded border border-1 fw-bold">
          No notes or references have been added
        </div>
      ) : (
        <Stack direction="vertical" gap={3}>
          {notes.map((note) => (
            <NoteCard
              key={note.note_id}
              note={note}
              isArchived={isArchived}
              onRemove={setNotePendingRemoval}
            />
          ))}
        </Stack>
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

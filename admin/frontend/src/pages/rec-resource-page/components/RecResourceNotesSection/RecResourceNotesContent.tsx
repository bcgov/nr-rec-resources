import { useState } from 'react';
import { Button, Spinner, Stack } from 'react-bootstrap';
import { Link } from '@tanstack/react-router';
import { EditableGuard } from '@/components/auth';
import { ROUTE_PATHS } from '@/constants/routes';
import { RecreationResourceNoteUIModel } from '@/services/mocks/recreationResourceNotes';
import { NoteCard } from './NoteCard';
import { NotesEmptyState } from './NotesEmptyState';
import { NoteFormModal } from './EditSection';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Notes and references</h2>

        <EditableGuard isArchived={isArchived}>
          {recResourceId ? (
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add note
              </Button>
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_NOTES_EDIT.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-outline-primary"
              >
                Edit
              </Link>
            </Stack>
          ) : null}
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
        <NotesEmptyState />
      ) : (
        <Stack direction="vertical" gap={3}>
          {notes.map((note) => (
            <NoteCard key={note.note_id} note={note} />
          ))}
        </Stack>
      )}

      {recResourceId && isAddModalOpen && (
        <NoteFormModal
          recResourceId={recResourceId}
          mode="create"
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </Stack>
  );
};

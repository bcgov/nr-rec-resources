import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Modal } from 'react-bootstrap';
import { RecreationResourceNoteUIModel } from '@/services/mocks/recreationResourceNotes';
import { NOTE_CREATE_CALLOUT } from './constants';
import { NoteForm } from './NoteForm';
import { NoteFormMode } from './hooks/useNoteForm';
import './NoteFormModal.scss';

export const NoteFormModal = ({
  recResourceId,
  mode,
  initialNote,
  onClose,
  onDelete,
  show = true,
}: {
  recResourceId: string;
  mode: NoteFormMode;
  initialNote?: RecreationResourceNoteUIModel;
  onClose: () => void;
  /** Only wired in edit mode - creates have nothing to delete yet. */
  onDelete?: () => void;
  show?: boolean;
}) => {
  const title = mode === 'create' ? 'Add new note' : 'Edit note';

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      // Caps the dialog at the viewport and scrolls the body rather than the page.
      scrollable
      className="note-form-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === 'create' && (
          <Alert variant="light" className="note-form-modal__callout">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="me-2"
              aria-hidden="true"
            />
            <strong>{NOTE_CREATE_CALLOUT}</strong>
          </Alert>
        )}

        {mode === 'edit' && !initialNote ? (
          <div>Note not found.</div>
        ) : (
          <NoteForm
            recResourceId={recResourceId}
            mode={mode}
            initialNote={initialNote}
            onDone={onClose}
            onCancel={onClose}
            onDelete={onDelete}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

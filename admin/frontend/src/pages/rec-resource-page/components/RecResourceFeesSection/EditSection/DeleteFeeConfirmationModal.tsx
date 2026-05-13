import { RecreationFeeUIModel } from '@/services';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from 'react-bootstrap';
import './DeleteFeeConfirmationModal.scss';

interface DeleteFeeConfirmationModalProps {
  show: boolean;
  fee?: RecreationFeeUIModel;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteFeeConfirmationModal = ({
  show,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteFeeConfirmationModalProps) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      className="delete-fee-confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete this fee?</Modal.Title>
      </Modal.Header>
      <Modal.Body className="delete-fee-confirmation-modal__body">
        Deleting this fee will immediately remove it from RecSpace and from the
        public website. This action cannot be undone, but the fee will remain in
        the backend for audit tracking.
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-primary"
          onClick={onCancel}
          className="delete-fee-confirmation-modal__cancel-button"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          className="delete-fee-confirmation-modal__confirm-button"
        >
          {!isDeleting && <FontAwesomeIcon icon={faTrash} className="me-2" />}
          {isDeleting ? 'Deleting...' : 'Delete fee'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

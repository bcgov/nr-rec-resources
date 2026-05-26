import { Modal } from 'react-bootstrap';
import { RecreationFeeUIModel, useDeleteFee } from '@/services';
import { RecResourceFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeForm';
import { useState } from 'react';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { addSuccessNotification } from '@/store/notificationStore';
import './RecResourceFeeForm.scss';

type FeeFormMode = 'create' | 'edit';

export const RecResourceFeeFormModal = ({
  recResourceId,
  mode,
  initialFee,
  onClose,
  show = true,
}: {
  recResourceId: string;
  mode: FeeFormMode;
  initialFee?: RecreationFeeUIModel;
  onClose: () => void;
  show?: boolean;
}) => {
  const title = mode === 'create' ? 'Add Fee' : 'Edit Fee';
  const deleteFee = useDeleteFee();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!initialFee?.fee_id) return;

    await deleteFee.mutateAsync({
      recResourceId,
      feeId: initialFee.fee_id,
    });

    setShowDeleteConfirm(false);
    onClose();
    addSuccessNotification('Fee deleted successfully', 'deleteFee-success');
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      className="rec-resource-fee-form-modal"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === 'edit' && !initialFee ? (
          <div>Fee not found.</div>
        ) : (
          <RecResourceFeeForm
            recResourceId={recResourceId}
            mode={mode}
            initialFee={initialFee}
            onDone={onClose}
            showDeleteAction={mode === 'edit' && Boolean(initialFee)}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </Modal.Body>

      <DeleteConfirmationModal
        show={showDeleteConfirm}
        title="Delete this fee?"
        description={
          'Deleting this fee will immediately remove it from RecSpace and from the public website. This action cannot be undone, but the fee will remain in the backend for audit tracking.'
        }
        isDeleting={deleteFee.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        className="delete-fee-confirmation-modal"
        bodyClassName="delete-fee-confirmation-modal__body"
        cancelButtonClassName="delete-fee-confirmation-modal__cancel-button"
        confirmButtonClassName="delete-fee-confirmation-modal__confirm-button"
        confirmText="Delete"
        confirmVariant="outline-danger"
      />
    </Modal>
  );
};

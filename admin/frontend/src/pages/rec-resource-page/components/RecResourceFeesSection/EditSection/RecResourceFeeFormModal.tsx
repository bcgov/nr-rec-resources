import { Modal } from 'react-bootstrap';
import { RecreationFeeUIModel } from '@/services';
import { RecResourceFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeeForm';
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
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

import { RecreationTrailDto } from '@/services/recreation-resource-admin/models';
import { Modal } from 'react-bootstrap';
import { TrailForm } from './TrailForm';

type TrailFormMode = 'create' | 'edit';

export const TrailFormModal = ({
  recResourceId,
  activityCode,
  mode,
  initialTrail,
  onClose,
  show = true,
}: {
  recResourceId: string;
  activityCode: number;
  mode: TrailFormMode;
  initialTrail?: RecreationTrailDto;
  onClose: () => void;
  show?: boolean;
}) => {
  const title = mode === 'create' ? 'Add trail' : 'Edit trail';

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TrailForm
          recResourceId={recResourceId}
          activityCode={activityCode}
          mode={mode}
          initialTrail={initialTrail}
          onDone={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};

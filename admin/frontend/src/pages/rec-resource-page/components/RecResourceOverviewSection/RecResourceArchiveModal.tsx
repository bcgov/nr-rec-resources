import { Col, Modal, Row } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { useArchiveRecResource } from '@/services/hooks/recreation-resource-admin/useArchiveRecResource';
import './RecResourceArchiveModal.scss';
import { useState } from 'react';

interface RecResourceArchiveModalProps {
  show: boolean;
  recResourceId: string;
  resourceName: string;
  onCancel: () => void;
}

export function RecResourceArchiveModal({
  show,
  recResourceId,
  resourceName,
  onCancel,
}: RecResourceArchiveModalProps) {
  const [isErrorState, setIsErrorState] = useState(false);
  const { mutateAsync: archiveResource } = useArchiveRecResource();

  const handleArchive = async () => {
    try {
      await archiveResource({ recResourceId: recResourceId });
      onCancel();
    } catch {
      setIsErrorState(true);
    }
  };

  const handleCancel = () => {
    setIsErrorState(false);
    onCancel();
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      className="archive-resource-modal"
      size="lg"
    >
      <Modal.Header closeButton className="archive-resource-modal__header">
        <Modal.Title className="archive-resource-modal__title">
          Archive Resource
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="archive-resource-modal__body">
        {!isErrorState && (
          <span className="archive-resource-modal__subtitle">{`${capitalizeWords(resourceName)} (${recResourceId}) will be archived.`}</span>
        )}
        <Row className="gy-3 mt-1">
          <Col>
            {isErrorState ? (
              <>
                <p>Resource couldn't be archived</p>
                <p>No changes were made.</p>
              </>
            ) : (
              <>
                It will:
                <ul>
                  <li>
                    no longer appear as an active resource on the public website
                  </li>
                  <li>be excluded from default active-resource reporting</li>
                  <li>remain available in RecSpace for historical reference</li>
                </ul>
                <span className="archive-resource-modal__subtitle">
                  No resource information will be deleted.
                </span>
              </>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <CustomButton variant="outline-primary" onClick={handleCancel}>
          {isErrorState ? 'Dismiss' : 'Cancel'}
        </CustomButton>
        <CustomButton variant="primary" onClick={handleArchive}>
          {isErrorState ? 'Try again' : 'Archive Resource'}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}

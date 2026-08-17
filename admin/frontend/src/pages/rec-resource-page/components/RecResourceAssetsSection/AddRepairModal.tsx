import { Col, Form, Modal, Row } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { MOCK_REPAIR_CODES } from './mockData';
import './AddRepairModal.scss';

interface AddRepairModalProps {
  show: boolean;
  onCancel: () => void;
  onCreate: () => void;
}

export function AddRepairModal({
  show,
  onCancel,
  onCreate,
}: AddRepairModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered className="add-repair-modal">
      <Modal.Header closeButton className="add-repair-modal__header">
        <Modal.Title className="add-repair-modal__title">
          Add repair
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-repair-modal__body">
        <h3 className="add-repair-modal__subtitle">Repair details</h3>

        <Row className="gy-3 mt-1">
          <Col xs={12} md={6}>
            <Form.Group controlId="add-repair-type">
              <Form.Label>Repair type</Form.Label>
              <Form.Select defaultValue="">
                <option value="" disabled>
                  Select repair type...
                </option>
                {MOCK_REPAIR_CODES.map((code) => (
                  <option key={code.repair_code} value={code.repair_code}>
                    {code.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="add-repair-completion-date">
              <Form.Label>Completion date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
          </Col>
        </Row>
        <h3 className="add-repair-modal__subtitle mt-4">Assets to repair</h3>
      </Modal.Body>
      <Modal.Footer className="add-repair-modal__footer">
        <CustomButton variant="outline-primary" onClick={onCancel}>
          Cancel
        </CustomButton>
        <CustomButton variant="primary" onClick={onCreate}>
          Create repairs
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}

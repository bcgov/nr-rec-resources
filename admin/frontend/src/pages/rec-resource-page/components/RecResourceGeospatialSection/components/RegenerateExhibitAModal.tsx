import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import {
  RegenerateModalState,
  RegenerateOptionsPatch,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/EditSection/hooks/useRegenerateExhibitA';
import {
  EXHIBIT_A_SCALE_OPTIONS,
  EXHIBIT_A_SIZE_OPTIONS,
  ExhibitAPageSize,
  ExhibitAScale,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/exhibitA';

type Props = Readonly<{
  state: RegenerateModalState;
  isPending: boolean;
  onChange: (patch: RegenerateOptionsPatch) => void;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function RegenerateExhibitAModal({
  state,
  isPending,
  onChange,
  onCancel,
  onConfirm,
}: Props) {
  const { show, row, size, orientation, scale } = state;
  const canSubmit = !isPending && !!size && !!orientation && !!scale;

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Regenerate Exhibit A</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3">
          <Col xs={5} className="fw-semibold">
            Rec resource ID
          </Col>
          <Col xs={7}>{row?.rec_resource_id ?? '-'}</Col>

          <Col xs={5} className="fw-semibold">
            Submission ID
          </Col>
          <Col xs={7}>{row?.submission_id ?? '-'}</Col>

          <Col xs={5} className="fw-semibold">
            Map size *
          </Col>
          <Col xs={7}>
            <Form.Select
              value={size}
              onChange={(e) =>
                onChange({ size: e.target.value as ExhibitAPageSize | '' })
              }
            >
              <option value="">Select...</option>
              {EXHIBIT_A_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={5} className="fw-semibold">
            Orientation *
          </Col>
          <Col xs={7}>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="exhibit-a-orientation-landscape"
                name="exhibit-a-orientation"
                label="Landscape"
                checked={orientation === 'L'}
                onChange={() => onChange({ orientation: 'L' })}
              />
              <Form.Check
                type="radio"
                id="exhibit-a-orientation-portrait"
                name="exhibit-a-orientation"
                label="Portrait"
                checked={orientation === 'P'}
                onChange={() => onChange({ orientation: 'P' })}
              />
            </div>
          </Col>

          <Col xs={5} className="fw-semibold">
            Scale *
          </Col>
          <Col xs={7}>
            <Form.Select
              value={scale}
              onChange={(e) => {
                const value = Number(e.target.value);
                onChange({
                  scale: Number.isNaN(value) ? '' : (value as ExhibitAScale),
                });
              }}
            >
              <option value="">Select...</option>
              {EXHIBIT_A_SCALE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {`1:${option.toLocaleString('en-CA')}`}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={!canSubmit}>
          Regenerate
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

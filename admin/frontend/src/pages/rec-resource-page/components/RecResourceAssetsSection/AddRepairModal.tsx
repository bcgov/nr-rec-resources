import { useState } from 'react';
import { Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import { CustomButton } from '@/components';
import { RepairAssetEntry } from './RepairAssetEntry';
import type { Asset, AssetCode, RepairCode } from './types';
import './AddRepairModal.scss';

interface RepairTypeOption {
  value: string;
  label: string;
}

interface AddRepairModalProps {
  show: boolean;
  repairCodes: RepairCode[];
  assetCodes: AssetCode[];
  assets: Asset[];
  onCancel: () => void;
  onCreate: () => void;
}

export function AddRepairModal({
  show,
  repairCodes,
  assetCodes,
  assets,
  onCancel,
  onCreate,
}: AddRepairModalProps) {
  const [entryIds, setEntryIds] = useState<number[]>([0]);
  const [selectedRepairType, setSelectedRepairType] = useState('');

  const repairTypeOptions: RepairTypeOption[] = [...repairCodes]
    .sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''))
    .map((code) => ({
      value: code.recreation_remed_repair_code,
      label: code.description ?? code.recreation_remed_repair_code,
    }));

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      className="add-repair-modal"
      size="lg"
    >
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
              <Select<RepairTypeOption>
                inputId="add-repair-type"
                aria-label="Repair type"
                options={repairTypeOptions}
                placeholder="Select repair type..."
                value={
                  repairTypeOptions.find(
                    (option) => option.value === selectedRepairType,
                  ) ?? null
                }
                onChange={(selected) =>
                  setSelectedRepairType(selected?.value ?? '')
                }
                classNamePrefix="select"
                isClearable
              />
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

        <Stack direction="vertical" gap={3} className="mt-3">
          {entryIds.map((id, index) => (
            <RepairAssetEntry
              key={id}
              assetCodes={assetCodes}
              assets={assets}
              onRemove={
                index === 0
                  ? undefined
                  : () =>
                      setEntryIds((ids) =>
                        ids.filter((entryId) => entryId !== id),
                      )
              }
            />
          ))}
        </Stack>

        <CustomButton
          variant="secondary"
          className="asset-summary-action-btn mt-3"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => setEntryIds((ids) => [...ids, (ids.at(-1) ?? 0) + 1])}
        >
          Add another type
        </CustomButton>
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

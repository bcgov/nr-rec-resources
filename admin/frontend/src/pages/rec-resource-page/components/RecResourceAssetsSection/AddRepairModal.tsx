import { useState } from 'react';
import { Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Select from 'react-select';
import { CustomButton } from '@/components';
import {
  createRepairGroupFormState,
  isRepairGroupValid,
  RepairAssetEntry,
} from './RepairAssetEntry';
import type { RepairGroupFormState } from './RepairAssetEntry';
import type { Asset, AssetCode, RepairCode } from './types';
import { useModalScrollFade } from './useModalScrollFade';
import './AddRepairModal.scss';

interface RepairTypeOption {
  value: string;
  label: string;
}

/**
 * Everything needed to submit an "add repair" request: the shared repair type
 * and completion date, plus one cost/asset-selection group per asset type.
 */
export interface AddRepairFormState {
  repairTypeCode: string;
  completionDate: string;
  repairGroups: RepairGroupFormState[];
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
  const { scrollRef, contentRef, canScrollUp, canScrollDown } =
    useModalScrollFade();
  const [selectedRepairType, setSelectedRepairType] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [repairGroups, setRepairGroups] = useState<RepairGroupFormState[]>([
    createRepairGroupFormState(0),
  ]);
  const [submitted, setSubmitted] = useState(false);
  // Ids of the groups that existed at the last submit attempt — a group added
  // afterwards shouldn't immediately show errors it was never validated against.
  const [validatedGroupIds, setValidatedGroupIds] = useState<Set<number>>(
    new Set(),
  );

  const hasSelectedAsset = repairGroups.some(
    (group) => group.selectedAssetIds.length > 0,
  );
  const repairTypeError = submitted && !selectedRepairType;

  const repairTypeOptions: RepairTypeOption[] = [...repairCodes]
    .sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''))
    .map((code) => ({
      value: code.recreation_remed_repair_code,
      label: code.description ?? code.recreation_remed_repair_code,
    }));

  const addRepairGroup = () => {
    setRepairGroups((groups) => [
      ...groups,
      createRepairGroupFormState((groups.at(-1)?.id ?? 0) + 1),
    ]);
  };

  const removeRepairGroup = (id: number) => {
    setRepairGroups((groups) => groups.filter((group) => group.id !== id));
  };

  const updateRepairGroup = (
    id: number,
    patch: Partial<RepairGroupFormState>,
  ) => {
    setRepairGroups((groups) =>
      groups.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    );
  };

  const resetForm = () => {
    setSelectedRepairType('');
    setCompletionDate('');
    setRepairGroups([createRepairGroupFormState(0)]);
    setSubmitted(false);
    setValidatedGroupIds(new Set());
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleCreateClick = () => {
    setSubmitted(true);
    setValidatedGroupIds(new Set(repairGroups.map((group) => group.id)));

    const isValid =
      Boolean(selectedRepairType) &&
      repairGroups.every((group) =>
        isRepairGroupValid(group, assets, assetCodes),
      );

    if (isValid) {
      onCreate();
      resetForm();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel}
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
        <div className="add-repair-modal__scroll-wrapper">
          <div
            className={clsx(
              'add-repair-modal__fade add-repair-modal__fade--top',
              canScrollUp && 'add-repair-modal__fade--visible',
            )}
          />
          <div ref={scrollRef} className="add-repair-modal__scroll-content">
            <div ref={contentRef}>
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
                      className={repairTypeError ? 'is-invalid' : ''}
                      classNamePrefix="select"
                      isClearable
                      // Portals the open menu out of the scrollable body — otherwise
                      // it gets clipped by the `overflow-y: auto` ancestor.
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 1060 }),
                      }}
                    />
                    {repairTypeError && (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        Repair type is required
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="add-repair-completion-date">
                    <Form.Label>Completion date</Form.Label>
                    <Form.Control
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <h3 className="add-repair-modal__subtitle mt-4">
                Assets to repair
              </h3>

              <Stack direction="vertical" gap={3} className="mt-3">
                {repairGroups.map((group, index) => (
                  <RepairAssetEntry
                    key={group.id}
                    entry={group}
                    assetCodes={assetCodes}
                    assets={assets}
                    onChange={(patch) => updateRepairGroup(group.id, patch)}
                    onRemove={
                      index === 0
                        ? undefined
                        : () => removeRepairGroup(group.id)
                    }
                    showErrors={validatedGroupIds.has(group.id)}
                  />
                ))}
              </Stack>

              <CustomButton
                variant="secondary"
                className="asset-summary-action-btn mt-3"
                leftIcon={<FontAwesomeIcon icon={faPlus} />}
                onClick={addRepairGroup}
              >
                Add another type
              </CustomButton>
            </div>
          </div>
          <div
            className={clsx(
              'add-repair-modal__fade add-repair-modal__fade--bottom',
              canScrollDown && 'add-repair-modal__fade--visible',
            )}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="add-repair-modal__footer">
        <CustomButton variant="outline-primary" onClick={handleCancel}>
          Cancel
        </CustomButton>
        <CustomButton
          variant="primary"
          onClick={handleCreateClick}
          disabled={!hasSelectedAsset}
        >
          Create repairs
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}

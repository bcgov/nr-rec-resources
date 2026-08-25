import { useState } from 'react';
import { Col, Form, Row, Button, InputGroup } from 'react-bootstrap';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDateReadable } from '@shared/utils';
import { CustomButton } from '@/components';
import { useCreateAssetRepair , useUpdateRepair } from '@/services/hooks/recreation-resource-admin';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { formatCurrency } from './formatCurrency';
import type { AssetRepair, RepairCode } from './types';
import './AssetCardRepairs.scss';

interface AssetCardRepairsProps {
  repairs: AssetRepair[];
  repairCodes: RepairCode[];
  assetId?: number;
  isEditing?: boolean;
  recResourceId?: string;
}

interface RepairField {
  label: string;
  value: string | null;
}

function getRepairTitle(
  repair: AssetRepair,
  repairCodes: RepairCode[],
): string | null {
  return (
    repairCodes.find(
      (code) =>
        code.recreation_remed_repair_code ===
        repair.recreation_remed_repair_code,
    )?.description ?? null
  );
}

function getRepairFields(
  repair: AssetRepair,
  canViewSensitiveInfo: boolean,
): RepairField[] {
  const fields: RepairField[] = [];

  if (canViewSensitiveInfo) {
    fields.push(
      {
        label: 'Estimated cost',
        value:
          repair.estimated_repair_cost != null
            ? formatCurrency(repair.estimated_repair_cost)
            : null,
      },
      {
        label: 'Actual cost',
        value:
          repair.actual_repair_cost != null
            ? formatCurrency(repair.actual_repair_cost)
            : null,
      },
    );
  }

  fields.push({
    label: 'Completed date',
    value: formatDateReadable(repair.repair_completed_date),
  });

  return fields.filter((field) => !!field.value);
}

interface RepairEditState {
  recreation_remed_repair_code: string;
  estimated_repair_cost: string;
  actual_repair_cost: string;
  repair_completed_date: string;
}

function RepairEditRow({
  repair,
  repairCodes,
  recResourceId,
  canViewSensitiveInfo,
}: {
  repair: AssetRepair;
  repairCodes: RepairCode[];
  recResourceId?: string;
  canViewSensitiveInfo: boolean;
}) {
  const [draft, setDraft] = useState<RepairEditState>({
    recreation_remed_repair_code: repair.recreation_remed_repair_code ?? '',
    estimated_repair_cost:
      repair.estimated_repair_cost != null
        ? String(repair.estimated_repair_cost)
        : '',
    actual_repair_cost:
      repair.actual_repair_cost != null
        ? String(repair.actual_repair_cost)
        : '',
    repair_completed_date: repair.repair_completed_date ?? '',
  });

  const { mutate: updateRepair } = useUpdateRepair();

  function handleBlur() {
    if (!recResourceId) return;
    updateRepair({
      repairId: repair.repair_id,
      recResourceId,
      dto: {
        recreation_remed_repair_code:
          draft.recreation_remed_repair_code || null,
        estimated_repair_cost: draft.estimated_repair_cost
          ? Number(draft.estimated_repair_cost)
          : null,
        actual_repair_cost: draft.actual_repair_cost
          ? Number(draft.actual_repair_cost)
          : null,
        repair_completed_date: draft.repair_completed_date || null,
      },
    });
  }

  return (
    <div className="asset-card-repairs__item">
      <Row className="gy-2 gx-2">
        <Col xs={12} sm={6}>
          <Form.Group controlId={`repair-type-${repair.repair_id}`}>
            <Form.Label className="fw-bold small mb-1">Repair type</Form.Label>
            <Form.Select
              size="sm"
              value={draft.recreation_remed_repair_code}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  recreation_remed_repair_code: e.target.value,
                }))
              }
              onBlur={handleBlur}
            >
              <option value="">Select repair type...</option>
              {repairCodes.map((code) => (
                <option
                  key={code.recreation_remed_repair_code}
                  value={code.recreation_remed_repair_code}
                >
                  {code.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={6} sm={3}>
          {canViewSensitiveInfo && (
            <Form.Group controlId={`repair-estimated-${repair.repair_id}`}>
              <Form.Label className="fw-bold small mb-1">
                Estimated cost
              </Form.Label>
              <Form.Control
                size="sm"
                type="number"
                step="any"
                value={draft.estimated_repair_cost}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    estimated_repair_cost: e.target.value,
                  }))
                }
                onBlur={handleBlur}
              />
            </Form.Group>
          )}
        </Col>
        <Col xs={6} sm={3}>
          {canViewSensitiveInfo && (
            <Form.Group controlId={`repair-actual-${repair.repair_id}`}>
              <Form.Label className="fw-bold small mb-1">
                Actual cost
              </Form.Label>
              <Form.Control
                size="sm"
                type="number"
                step="any"
                value={draft.actual_repair_cost}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    actual_repair_cost: e.target.value,
                  }))
                }
                onBlur={handleBlur}
              />
            </Form.Group>
          )}
        </Col>
        <Col xs={6} sm={3}>
          <Form.Group controlId={`repair-completed-${repair.repair_id}`}>
            <Form.Label className="fw-bold small mb-1">
              Completed date
            </Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={draft.repair_completed_date}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  repair_completed_date: e.target.value,
                }))
              }
              onBlur={handleBlur}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}

const EMPTY_FORM = {
  repairCode: '',
  estimatedCost: '',
  actualCost: '',
  completedDate: '',
};

export function AssetCardRepairs({
  repairs,
  repairCodes,
  assetId,
  recResourceId,
  isEditing = false,

}: AssetCardRepairsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { canViewSensitiveInfo } = useAuthorizations();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { mutate: createRepair, isPending: isCreating } =
    useCreateAssetRepair();

  const visibleRepairs = repairs
    .map((repair) => ({
      repair,
      title: getRepairTitle(repair, repairCodes),
    }))
    .filter(
      (entry): entry is { repair: AssetRepair; title: string } => !!entry.title,
    );

  function handleAddRepair() {
    setShowAddForm(true);
  }

  function handleCancelAdd() {
    setShowAddForm(false);
    setForm(EMPTY_FORM);
  }

  function handleSaveRepair() {
    if (!assetId || !recResourceId) return;
    createRepair(
      {
        assetId,
        recResourceId,
        dto: {
          recreation_remed_repair_code: form.repairCode || null,
          estimated_repair_cost: form.estimatedCost
            ? parseFloat(form.estimatedCost)
            : null,
          actual_repair_cost: form.actualCost
            ? parseFloat(form.actualCost)
            : null,
          repair_completed_date: form.completedDate || null,
        },
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setForm(EMPTY_FORM);
        },
      },
    );
  }

  return (
    <div className="asset-card-repairs">
      <button
        type="button"
        aria-label={isExpanded ? 'Hide repairs' : 'Show repairs'}
        aria-expanded={isExpanded}
        className="btn btn-link expand-link asset-card__expand-link"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? 'Hide repairs' : 'Show repairs'}
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="ms-2"
        />
      </button>

      {isExpanded && (
        <div className="asset-card-repairs__expandable">
          {isEditing ? (
            <>
              {repairs.length > 0 ? (
                <div className="asset-card-repairs__list">
                  {repairs.map((repair) => (
                    <RepairEditRow
                      key={repair.repair_id}
                      repair={repair}
                      repairCodes={repairCodes}
                      recResourceId={recResourceId}
                      canViewSensitiveInfo={canViewSensitiveInfo}
                    />
                  ))}
                </div>
              ) : (
                <div className="asset-card-repairs__empty">
                  This asset has no repairs
                </div>
              )}
            </>
          ) : (
            <>
              {visibleRepairs.length > 0 ? (
                <div className="asset-card-repairs__list">
                  {visibleRepairs.map(({ repair, title }) => {
                    const fields = getRepairFields(
                      repair,
                      canViewSensitiveInfo,
                    );
                    return (
                      <div
                        key={repair.repair_id}
                        className="asset-card-repairs__item"
                      >
                        <div className="asset-card-repairs__item-title">
                          {title}
                        </div>
                        {fields.length > 0 && (
                          <div className="asset-card-repairs__item-fields">
                            {fields.map((field) => (
                              <span
                                key={field.label}
                                className="asset-card-repairs__item-field"
                              >
                                <span className="asset-card-repairs__item-field-label">
                                  {field.label}:
                                </span>{' '}
                                {field.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !showAddForm && (
                  <div className="asset-card-repairs__empty">
                    This asset has no repairs
                  </div>
                )
              )}
            </>
          )}

          {showAddForm && !isEditing && (
            <div className="asset-card-repairs__add-form">
              <div className="asset-card-repairs__add-form-fields">
                <Form.Group controlId={`repair-type-${assetId}`}>
                  <Form.Label>Repair type</Form.Label>
                  <Form.Select
                    value={form.repairCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, repairCode: e.target.value }))
                    }
                  >
                    <option value="">Select type…</option>
                    {repairCodes.map((code) => (
                      <option
                        key={code.recreation_remed_repair_code}
                        value={code.recreation_remed_repair_code}
                      >
                        {code.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId={`repair-est-cost-${assetId}`}>
                  <Form.Label>Estimated cost</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={form.estimatedCost}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          estimatedCost: e.target.value,
                        }))
                      }
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group controlId={`repair-actual-cost-${assetId}`}>
                  <Form.Label>Actual cost</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={form.actualCost}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, actualCost: e.target.value }))
                      }
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group controlId={`repair-date-${assetId}`}>
                  <Form.Label>Completed date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.completedDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, completedDate: e.target.value }))
                    }
                  />
                </Form.Group>
              </div>

              <div className="asset-card-repairs__add-form-actions">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCancelAdd}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveRepair}
                  disabled={isCreating || !form.repairCode}
                >
                  {isCreating ? 'Saving…' : 'Save repair'}
                </Button>
              </div>
            </div>
          )}

          {(!showAddForm || isEditing) && (
            <CustomButton
              variant="secondary"
              className="asset-summary-action-btn asset-card-repairs__add-btn"
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={handleAddRepair}
              disabled={isEditing}
            >
              Add repair
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
}

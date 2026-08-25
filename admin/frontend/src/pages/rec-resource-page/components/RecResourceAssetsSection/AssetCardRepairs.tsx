import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDateReadable } from '@shared/utils';
import { CustomButton } from '@/components';
import { useUpdateRepair } from '@/services/hooks/recreation-resource-admin';
import { formatCurrency } from './formatCurrency';
import type { AssetRepair, RepairCode } from './types';
import './AssetCardRepairs.scss';

interface AssetCardRepairsProps {
  repairs: AssetRepair[];
  repairCodes: RepairCode[];
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

function getRepairFields(repair: AssetRepair): RepairField[] {
  const fields: RepairField[] = [
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
    {
      label: 'Completed date',
      value: formatDateReadable(repair.repair_completed_date),
    },
  ];

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
}: {
  repair: AssetRepair;
  repairCodes: RepairCode[];
  recResourceId?: string;
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
        </Col>
        <Col xs={6} sm={3}>
          <Form.Group controlId={`repair-actual-${repair.repair_id}`}>
            <Form.Label className="fw-bold small mb-1">Actual cost</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              step="any"
              value={draft.actual_repair_cost}
              onChange={(e) =>
                setDraft((d) => ({ ...d, actual_repair_cost: e.target.value }))
              }
              onBlur={handleBlur}
            />
          </Form.Group>
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

export function AssetCardRepairs({
  repairs,
  repairCodes,
  isEditing = false,
  recResourceId,
}: AssetCardRepairsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleRepairs = repairs
    .map((repair) => ({
      repair,
      title: getRepairTitle(repair, repairCodes),
    }))
    .filter(
      (entry): entry is { repair: AssetRepair; title: string } => !!entry.title,
    );

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
                    const fields = getRepairFields(repair);
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
                <div className="asset-card-repairs__empty">
                  This asset has no repairs
                </div>
              )}
            </>
          )}

          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn asset-card-repairs__add-btn"
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Add repair
          </CustomButton>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { CustomButton } from '@/components';
import {
  useCreateAssetRepair,
  useUpdateAssetRepair,
} from '@/services/hooks/recreation-resource-admin';
import type { AssetRepair, RepairCode } from './types';
import './AssetCardRepairs.scss';

interface AssetCardRepairsEditProps {
  repairs: AssetRepair[];
  repairCodes: RepairCode[];
  recResourceId: string;
  assetId: number;
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

const EMPTY_FORM = {
  repairCode: '',
  estimatedCost: '',
  actualCost: '',
  completedDate: '',
};

export function AssetCardRepairsEdit({
  repairs,
  repairCodes,
  recResourceId,
  assetId,
}: AssetCardRepairsEditProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { mutate: updateRepair } = useUpdateAssetRepair();
  const { mutate: createRepair, isPending: isCreating } =
    useCreateAssetRepair();

  const visibleRepairs = repairs
    .slice()
    .sort((a, b) => a.repair_id - b.repair_id)
    .map((repair) => ({
      repair,
      title: getRepairTitle(repair, repairCodes),
    }))
    .filter(
      (entry): entry is { repair: AssetRepair; title: string } => !!entry.title,
    );

  function handleBlur(
    repairId: number,
    field:
      | 'estimated_repair_cost'
      | 'actual_repair_cost'
      | 'repair_completed_date',
    value: string,
  ) {
    const parsed =
      field === 'repair_completed_date'
        ? value || null
        : value === ''
          ? null
          : parseFloat(value);

    updateRepair({
      repairId,
      recResourceId,
      dto: { [field]: parsed },
    });
  }

  function handleSaveRepair() {
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
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? 'Hide repairs' : 'Show repairs'}
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="ms-2"
        />
      </button>

      {isExpanded && (
        <div className="asset-card-repairs__expandable">
          {visibleRepairs.length > 0 ? (
            <div className="asset-card-repairs__list">
              {visibleRepairs.map(({ repair, title }) => (
                <div
                  key={repair.repair_id}
                  className="asset-card-repairs__item"
                >
                  <div className="asset-card-repairs__item-title">{title}</div>
                  <div className="asset-card-repairs__item-edit-fields">
                    <Form.Group controlId={`repair-est-${repair.repair_id}`}>
                      <Form.Label>Estimated cost</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          defaultValue={repair.estimated_repair_cost ?? ''}
                          onBlur={(e) =>
                            handleBlur(
                              repair.repair_id,
                              'estimated_repair_cost',
                              e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId={`repair-actual-${repair.repair_id}`}>
                      <Form.Label>Actual cost</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          defaultValue={repair.actual_repair_cost ?? ''}
                          onBlur={(e) =>
                            handleBlur(
                              repair.repair_id,
                              'actual_repair_cost',
                              e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId={`repair-date-${repair.repair_id}`}>
                      <Form.Label>Completed date</Form.Label>
                      <Form.Control
                        type="date"
                        defaultValue={
                          repair.repair_completed_date?.slice(0, 10) ?? ''
                        }
                        onBlur={(e) =>
                          handleBlur(
                            repair.repair_id,
                            'repair_completed_date',
                            e.target.value,
                          )
                        }
                      />
                    </Form.Group>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showAddForm && (
              <div className="asset-card-repairs__empty">
                This asset has no repairs
              </div>
            )
          )}

          {showAddForm && (
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

                <Form.Group controlId={`repair-est-cost-add-${assetId}`}>
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

                <Form.Group controlId={`repair-actual-cost-add-${assetId}`}>
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

                <Form.Group controlId={`repair-date-add-${assetId}`}>
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
                  onClick={() => {
                    setShowAddForm(false);
                    setForm(EMPTY_FORM);
                  }}
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

          {!showAddForm && (
            <CustomButton
              variant="secondary"
              className="asset-summary-action-btn asset-card-repairs__add-btn"
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setShowAddForm(true)}
            >
              Add repair
            </CustomButton>
          )}
        </div>
      )}
    </div>
  );
}

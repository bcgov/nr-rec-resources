import { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, InputGroup } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { useCreateAssetRepair } from '@/services/hooks/recreation-resource-admin';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import {
  EMPTY_REPAIR_FORM,
  getRepairTitle,
  RepairAddForm,
  RepairExpandToggle,
} from './repairShared';
import type { AssetRepair, RepairCode } from './types';
import './AssetCardRepairs.scss';

interface AssetCardRepairsEditProps {
  repairs: AssetRepair[];
  repairCodes: RepairCode[];
  recResourceId: string;
  assetId: number;
  /** Called on every repair field blur so the parent can batch-save on Save */
  onRepairChange?: (
    repairId: number,
    dto: Partial<UpdateRecreationAssetRepairDto>,
  ) => void;
}

export function AssetCardRepairsEdit({
  repairs,
  repairCodes,
  recResourceId,
  assetId,
  onRepairChange,
}: AssetCardRepairsEditProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_REPAIR_FORM);
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

    onRepairChange?.(repairId, { [field]: parsed });
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
          setForm(EMPTY_REPAIR_FORM);
        },
      },
    );
  }

  return (
    <div className="asset-card-repairs">
      <RepairExpandToggle
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />

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
            <RepairAddForm
              idSuffix={`add-${assetId}`}
              repairCodes={repairCodes}
              form={form}
              isCreating={isCreating}
              onFormChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
              onCancel={() => {
                setShowAddForm(false);
                setForm(EMPTY_REPAIR_FORM);
              }}
              onSave={handleSaveRepair}
            />
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

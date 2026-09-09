import { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import {
  useCreateAssetRepair,
  useDeleteAssetRepair,
} from '@/services/hooks/recreation-resource-admin';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import {
  buildRepairMutationDto,
  EMPTY_REPAIR_FORM,
  getRepairTitle,
  parseOptionalRepairNumber,
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
  const [repairToDelete, setRepairToDelete] = useState<{
    repairId: number;
    title: string;
  } | null>(null);
  const { mutate: createRepair, isPending: isCreating } =
    useCreateAssetRepair();
  const { mutate: deleteRepair, isPending: isDeletingRepair } =
    useDeleteAssetRepair();

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
        : parseOptionalRepairNumber(value);

    onRepairChange?.(repairId, { [field]: parsed });
  }

  function handleSaveRepair() {
    createRepair(
      {
        assetId,
        recResourceId,
        dto: buildRepairMutationDto(form),
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setForm(EMPTY_REPAIR_FORM);
        },
      },
    );
  }

  function handleConfirmDeleteRepair() {
    if (!repairToDelete) return;

    deleteRepair(
      {
        repairId: repairToDelete.repairId,
        recResourceId,
      },
      {
        onSuccess: () => setRepairToDelete(null),
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
                  <div className="d-flex justify-content-end mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline-primary"
                      className="asset-card-repairs__delete-btn"
                      onClick={() =>
                        setRepairToDelete({ repairId: repair.repair_id, title })
                      }
                    >
                      Delete
                    </Button>
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

      <DeleteConfirmationModal
        show={repairToDelete !== null}
        title="Delete repair?"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong>{repairToDelete?.title ?? 'this repair'}</strong>?
          </>
        }
        isDeleting={isDeletingRepair}
        onCancel={() => setRepairToDelete(null)}
        onConfirm={handleConfirmDeleteRepair}
        confirmText="Delete"
        confirmVariant="outline-primary"
        confirmButtonClassName="delete-confirmation-modal__confirm-button--blue-outline"
      />
    </div>
  );
}

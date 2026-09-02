/**
 * Shared utilities and sub-components for AssetCardRepairs / AssetCardRepairsEdit.
 * Centralising these removes duplication flagged by static analysis.
 */
import { Button, Form, InputGroup } from 'react-bootstrap';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AssetRepair, RepairCode } from './types';

// ---------------------------------------------------------------------------
// Shared constants / types
// ---------------------------------------------------------------------------

export interface RepairFormState {
  repairCode: string;
  estimatedCost: string;
  actualCost: string;
  completedDate: string;
}

export interface RepairMutationDto {
  recreation_remed_repair_code: string | null;
  estimated_repair_cost: number | null;
  actual_repair_cost: number | null;
  repair_completed_date: string | null;
}

export function parseOptionalRepairNumber(value: string): number | null {
  return value === '' ? null : parseFloat(value);
}

export function buildRepairMutationDto(
  form: RepairFormState,
): RepairMutationDto {
  return {
    recreation_remed_repair_code: form.repairCode || null,
    estimated_repair_cost: parseOptionalRepairNumber(form.estimatedCost),
    actual_repair_cost: parseOptionalRepairNumber(form.actualCost),
    repair_completed_date: form.completedDate || null,
  };
}

export const EMPTY_REPAIR_FORM: RepairFormState = {
  repairCode: '',
  estimatedCost: '',
  actualCost: '',
  completedDate: '',
};

// ---------------------------------------------------------------------------
// Shared pure helpers
// ---------------------------------------------------------------------------

export function getRepairTitle(
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

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

interface RepairExpandToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function RepairExpandToggle({
  isExpanded,
  onToggle,
}: RepairExpandToggleProps) {
  return (
    <button
      type="button"
      aria-label={isExpanded ? 'Hide repairs' : 'Show repairs'}
      aria-expanded={isExpanded}
      className="btn btn-link expand-link asset-card__expand-link"
      onClick={onToggle}
    >
      {isExpanded ? 'Hide repairs' : 'Show repairs'}
      <FontAwesomeIcon
        icon={isExpanded ? faChevronUp : faChevronDown}
        className="ms-2"
      />
    </button>
  );
}

interface RepairAddFormProps {
  /** Used to generate unique control IDs */
  idSuffix: string | number;
  repairCodes: RepairCode[];
  form: RepairFormState;
  isCreating: boolean;
  onFormChange: (updates: Partial<RepairFormState>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function RepairAddForm({
  idSuffix,
  repairCodes,
  form,
  isCreating,
  onFormChange,
  onCancel,
  onSave,
}: RepairAddFormProps) {
  return (
    <div className="asset-card-repairs__add-form">
      <div className="asset-card-repairs__add-form-fields">
        <Form.Group controlId={`repair-type-${idSuffix}`}>
          <Form.Label>Repair type</Form.Label>
          <Form.Select
            value={form.repairCode}
            onChange={(e) => onFormChange({ repairCode: e.target.value })}
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

        <Form.Group controlId={`repair-est-cost-${idSuffix}`}>
          <Form.Label>Estimated cost</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              type="number"
              step="0.01"
              value={form.estimatedCost}
              onChange={(e) => onFormChange({ estimatedCost: e.target.value })}
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId={`repair-actual-cost-${idSuffix}`}>
          <Form.Label>Actual cost</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              type="number"
              step="0.01"
              value={form.actualCost}
              onChange={(e) => onFormChange({ actualCost: e.target.value })}
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId={`repair-date-${idSuffix}`}>
          <Form.Label>Completed date</Form.Label>
          <Form.Control
            type="date"
            value={form.completedDate}
            onChange={(e) => onFormChange({ completedDate: e.target.value })}
          />
        </Form.Group>
      </div>

      <div className="asset-card-repairs__add-form-actions">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={isCreating || !form.repairCode}
        >
          {isCreating ? 'Saving…' : 'Save repair'}
        </Button>
      </div>
    </div>
  );
}

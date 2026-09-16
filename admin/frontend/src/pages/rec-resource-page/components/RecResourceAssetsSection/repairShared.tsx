/**
 * Shared utilities and sub-components for AssetCardRepairs / AssetCardRepairsEdit.
 * Centralising these removes duplication flagged by static analysis.
 */
import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isValidStationValue, STATION_COORDINATE_ERROR } from './trailStations';
import type { AssetRepair, RepairCode } from './types';

// ---------------------------------------------------------------------------
// Shared constants / types
// ---------------------------------------------------------------------------

export interface RepairFormState {
  repairCode: string;
  estimatedCost: string;
  actualCost: string;
  completedDate: string;
  startStation: string;
  endStation: string;
}

export interface RepairMutationDto {
  recreation_remed_repair_code: string | null;
  estimated_repair_cost: number | null;
  actual_repair_cost: number | null;
  repair_completed_date: string | null;
  trail_segment_start: string | null;
  trail_segment_end: string | null;
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
    // Stations only render for trail assets, so they are empty otherwise.
    trail_segment_start: form.startStation.trim() || null,
    trail_segment_end: form.endStation.trim() || null,
  };
}

export const EMPTY_REPAIR_FORM: RepairFormState = {
  repairCode: '',
  estimatedCost: '',
  actualCost: '',
  completedDate: '',
  startStation: '',
  endStation: '',
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

type StationFormField = 'startStation' | 'endStation';

const ADD_FORM_STATION_FIELDS: {
  field: StationFormField;
  label: string;
  placeholder: string;
}[] = [
  {
    field: 'startStation',
    label: 'Start station',
    placeholder: 'e.g. 49.232423, -128.334343',
  },
  {
    field: 'endStation',
    label: 'End station',
    placeholder: 'e.g. 49.234561, -128.331872',
  },
];

interface RepairAddFormProps {
  /** Used to generate unique control IDs */
  idSuffix: string | number;
  repairCodes: RepairCode[];
  form: RepairFormState;
  isCreating: boolean;
  isTrailAsset?: boolean;
  onFormChange: (updates: Partial<RepairFormState>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function RepairAddForm({
  idSuffix,
  repairCodes,
  form,
  isCreating,
  isTrailAsset = false,
  onFormChange,
  onCancel,
  onSave,
}: RepairAddFormProps) {
  // Like the bulk repair modal, coordinate errors stay hidden until the first
  // Save attempt; after that they track edits live so a fix clears them.
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const hasStationErrors =
    isTrailAsset &&
    ADD_FORM_STATION_FIELDS.some(
      ({ field }) => !isValidStationValue(form[field]),
    );

  function handleSaveClick() {
    setHasAttemptedSave(true);

    if (hasStationErrors) {
      return;
    }

    onSave();
  }

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

        {isTrailAsset &&
          ADD_FORM_STATION_FIELDS.map(({ field, label, placeholder }) => {
            const hasError =
              hasAttemptedSave && !isValidStationValue(form[field]);

            return (
              <Form.Group
                key={field}
                controlId={`repair-${field}-${idSuffix}`}
                className="asset-card-repairs__station-group"
              >
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={placeholder}
                  isInvalid={hasError}
                  value={form[field]}
                  onChange={(e) => onFormChange({ [field]: e.target.value })}
                />
                {hasError && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {STATION_COORDINATE_ERROR}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            );
          })}
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
          onClick={handleSaveClick}
          disabled={isCreating || !form.repairCode}
        >
          {isCreating ? 'Saving…' : 'Save repair'}
        </Button>
      </div>
    </div>
  );
}

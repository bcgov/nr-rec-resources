import { Form } from 'react-bootstrap';
import { CustomButton } from '@/components';
import { formatDateReadable } from '@shared/utils';
import resourceInspection from '@shared/assets/icons/asset-type.svg';
import dangerTreeAssessment from '@shared/assets/icons/danger-tree-inspection.svg';
import './InspectionDatesEdit.scss';

export interface InspectionDatesEditProps {
  /** Current persisted inspection date (for display only) */
  currentInspectionDate: Date | null | undefined;
  /** Current persisted danger tree date (for display only) */
  currentDangerTreeDate: Date | null | undefined;
  /** Controlled value for the inspection date input */
  inspectionDate: string;
  /** Controlled value for the danger tree date input */
  dangerTreeDate: string;
  isSaving: boolean;
  onInspectionDateChange: (value: string) => void;
  onDangerTreeDateChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InspectionDatesEdit({
  currentInspectionDate,
  currentDangerTreeDate,
  inspectionDate,
  dangerTreeDate,
  isSaving,
  onInspectionDateChange,
  onDangerTreeDateChange,
  onSave,
  onCancel,
}: InspectionDatesEditProps) {
  const resourceInspectionLabel =
    formatDateReadable(inspectionDate || currentInspectionDate) ??
    'No inspection recorded';
  const dangerTreeInspectionLabel =
    formatDateReadable(dangerTreeDate || currentDangerTreeDate) ??
    'No inspection recorded';

  return (
    <section
      className="inspection-dates-edit"
      aria-label="Record inspection dates"
    >
      <div className="inspection-dates-edit__header">
        <h3 className="inspection-dates-edit__title mb-0">
          Record inspection dates
        </h3>
        <div className="d-flex gap-2 inspection-dates-edit__actions">
          <CustomButton
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </CustomButton>
          <CustomButton variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </CustomButton>
        </div>
      </div>
      <div className="inspection-dates-edit__fields">
        <div className="inspection-dates-edit__field-col">
          <div className="inspection-dates-edit__meta">
            <div className="inspection-dates-edit__meta-title-row">
              <img
                alt="Resource inspection icon"
                src={resourceInspection}
                height={14}
                width={13}
              />
              <span className="inspection-dates-edit__meta-title">
                Resource inspection
              </span>
            </div>
            <div className="inspection-dates-edit__meta-value">
              Last inspected: {resourceInspectionLabel}
            </div>
          </div>
          <Form.Control
            type="date"
            value={inspectionDate}
            onChange={(e) => onInspectionDateChange(e.target.value)}
            placeholder="Select date"
            aria-label="Date of last resource inspection"
          />
        </div>
        <div className="inspection-dates-edit__field-col">
          <div className="inspection-dates-edit__meta">
            <div className="inspection-dates-edit__meta-title-row">
              <img
                alt="Danger tree assessment icon"
                src={dangerTreeAssessment}
                height={14}
                width={13}
              />
              <span className="inspection-dates-edit__meta-title">
                Danger tree inspection
              </span>
            </div>
            <div className="inspection-dates-edit__meta-value">
              Last inspected: {dangerTreeInspectionLabel}
            </div>
          </div>
          <Form.Control
            type="date"
            value={dangerTreeDate}
            onChange={(e) => onDangerTreeDateChange(e.target.value)}
            placeholder="Select date"
            aria-label="Date of last danger tree inspection"
          />
        </div>
      </div>
    </section>
  );
}

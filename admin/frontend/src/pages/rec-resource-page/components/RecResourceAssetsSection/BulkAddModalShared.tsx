/**
 * Shared UI building blocks used by both BulkAddCampsitesModal and
 * BulkAddAssetsModal.  Import what you need from this file instead of
 * duplicating markup / styles.
 */
import type { ReactNode } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { CustomButton } from '@/components';
import './BulkAddModalShared.scss';

// ---------------------------------------------------------------------------
// Coordinate validation helpers (shared between both bulk modals)
// ---------------------------------------------------------------------------

export interface RowErrors {
  latitude?: string;
  longitude?: string;
}

export interface CoordinateRow {
  latitude: string;
  longitude: string;
}

export function validateLatitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = parseFloat(value);
  if (isNaN(n)) return 'Must be a valid number';
  if (n < -90 || n > 90) return 'Must be between -90 and 90';
  return undefined;
}

export function validateLongitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = parseFloat(value);
  if (isNaN(n)) return 'Must be a valid number';
  if (n < -180 || n > 180) return 'Must be between -180 and 180';
  return undefined;
}

export function validateCoordinateRow(row: CoordinateRow): RowErrors {
  const errors: RowErrors = {};
  const latError = validateLatitude(row.latitude);
  const lngError = validateLongitude(row.longitude);
  if (latError) errors.latitude = latError;
  if (lngError) errors.longitude = lngError;
  if (row.latitude !== '' && row.longitude === '')
    errors.longitude = 'Longitude is required when latitude is set';
  if (row.longitude !== '' && row.latitude === '')
    errors.latitude = 'Latitude is required when longitude is set';
  return errors;
}

// ---------------------------------------------------------------------------
// NumberStepperInput  (− / value / + stepper)
// ---------------------------------------------------------------------------

interface NumberStepperInputProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  onChange: (value: number) => void;
}

export function NumberStepperInput({
  value,
  min = 1,
  max = 100,
  label = 'How many do you want to add?',
  onChange,
}: NumberStepperInputProps) {
  return (
    <Form.Group className="bulk-modal__quantity-group">
      <Form.Label className="bulk-modal__quantity-label">{label}</Form.Label>
      <div className="bulk-modal__stepper">
        <button
          type="button"
          className="bulk-modal__stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <Form.Control
          type="number"
          min={min}
          max={max}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Math.max(min, Math.min(max, n)));
          }}
          className="bulk-modal__stepper-input"
        />
        <button
          type="button"
          className="bulk-modal__stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </Form.Group>
  );
}

// ---------------------------------------------------------------------------
// BulkCreationPreview  (ice-blue wrapper + "Creating N …" heading)
// ---------------------------------------------------------------------------

interface BulkCreationPreviewProps {
  heading: string;
  children: ReactNode;
}

export function BulkCreationPreview({
  heading,
  children,
}: BulkCreationPreviewProps) {
  return (
    <div className="bulk-modal__preview-section">
      <p className="bulk-modal__preview-heading">{heading}</p>
      <div className="bulk-modal__item-list">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BulkAssetPreviewRow  (name + ID header, fields slot, optional blue divider)
// ---------------------------------------------------------------------------

interface BulkAssetPreviewRowProps {
  name: string;
  showDivider?: boolean;
  children: ReactNode;
}

export function BulkAssetPreviewRow({
  name,
  showDivider = false,
  children,
}: BulkAssetPreviewRowProps) {
  return (
    <div className="bulk-modal__item-row">
      <div className="bulk-modal__item-row-header">
        <span className="bulk-modal__item-row-name">{name}</span>
      </div>
      {children}
      {showDivider && <div className="bulk-modal__row-divider" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BulkAddModalLayout  (full modal with shared header + footer chrome)
// ---------------------------------------------------------------------------

interface BulkAddModalLayoutProps {
  show: boolean;
  title: string;
  onHide: () => void;
  onShow?: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export function BulkAddModalLayout({
  show,
  title,
  onHide,
  onShow,
  submitLabel,
  submitDisabled = false,
  isPending = false,
  onCancel,
  onSubmit,
  children,
}: BulkAddModalLayoutProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      onShow={onShow}
      centered
      className="bulk-modal"
    >
      <Modal.Header closeButton className="bulk-modal__header">
        <Modal.Title as="h4" className="bulk-modal__title">
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bulk-modal__body">{children}</Modal.Body>

      <Modal.Footer className="bulk-modal__footer">
        <CustomButton
          variant="outline-secondary"
          onClick={onCancel}
          className="bulk-modal__btn-cancel"
        >
          Cancel
        </CustomButton>
        <CustomButton
          variant="primary"
          onClick={onSubmit}
          disabled={submitDisabled || isPending}
          className="bulk-modal__btn-create"
        >
          {isPending ? 'Creating…' : submitLabel}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}

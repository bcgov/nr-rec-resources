import { useState, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useCreateBulkAssets } from '@/services/hooks/recreation-resource-admin';
import type { Asset } from './types';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import {
  BulkAddModalLayout,
  BulkCreationPreview,
  BulkAssetPreviewRow,
  NumberStepperInput,
} from './BulkAddModalShared';

interface BulkAddCampsitesModalProps {
  show: boolean;
  recResourceId: string;
  existingAssets: Asset[];
  onCancel: () => void;
  onCreate: () => void;
}

interface CampsiteRow {
  latitude: string;
  longitude: string;
}

interface RowErrors {
  latitude?: string;
  longitude?: string;
}

function validateLatitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = parseFloat(value);
  if (isNaN(n)) return 'Must be a valid number';
  if (n < -90 || n > 90) return 'Must be between -90 and 90';
  return undefined;
}

function validateLongitude(value: string): string | undefined {
  if (value === '') return undefined;
  const n = parseFloat(value);
  if (isNaN(n)) return 'Must be a valid number';
  if (n < -180 || n > 180) return 'Must be between -180 and 180';
  return undefined;
}

function validateRow(row: CampsiteRow): RowErrors {
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

/**
 * Generates a campsite identifier.
 * Format: Campsite-{number:02d}-{recResourceId}
 */
function generateCampsiteId(number: number, recResourceId: string): string {
  const seq = String(number).padStart(2, '0');
  return `Campsite-${seq}-${recResourceId}`;
}

/**
 * Returns the highest existing campsite number by parsing campsite asset names
 * (e.g. "Campsite 7" → 7). Falls back to the total count of campsites.
 */
function getHighestCampsiteNumber(campsites: Asset[]): number {
  if (campsites.length === 0) return 0;
  const numbers = campsites
    .map((c) => {
      const match = c.asset_name?.match(/(\d+)\s*$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);
  return numbers.length > 0 ? Math.max(...numbers) : campsites.length;
}

export function BulkAddCampsitesModal({
  show,
  recResourceId,
  existingAssets,
  onCancel,
  onCreate,
}: BulkAddCampsitesModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [campsiteRows, setCampsiteRows] = useState<CampsiteRow[]>([
    { latitude: '', longitude: '' },
  ]);
  const [rowErrors, setRowErrors] = useState<RowErrors[]>([{}]);

  const { mutateAsync: bulkCreate, isPending } = useCreateBulkAssets();

  const existingCampsites = useMemo(
    () =>
      existingAssets.filter((a) => a.asset_code === CAMPSITE_STRUCTURE_CODE),
    [existingAssets],
  );

  const highestNumber = useMemo(
    () => getHighestCampsiteNumber(existingCampsites),
    [existingCampsites],
  );

  const updateQuantity = (qty: number) => {
    setQuantity(qty);
    setCampsiteRows((prev) => {
      const updated = [...prev];
      while (updated.length < qty)
        updated.push({ latitude: '', longitude: '' });
      return updated.slice(0, qty);
    });
    setRowErrors((prev) => {
      const updated = [...prev];
      while (updated.length < qty) updated.push({});
      return updated.slice(0, qty);
    });
  };

  const updateRow = (
    index: number,
    field: keyof CampsiteRow,
    value: string,
  ) => {
    setCampsiteRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      setRowErrors((errs) => {
        const updatedErrs = [...errs];
        updatedErrs[index] = validateRow(updated[index]);
        return updatedErrs;
      });
      return updated;
    });
  };

  const handleClose = () => {
    setQuantity(1);
    setCampsiteRows([{ latitude: '', longitude: '' }]);
    setRowErrors([{}]);
    onCancel();
  };

  const hasErrors = rowErrors.some(
    (e) => e.latitude !== undefined || e.longitude !== undefined,
  );

  const handleSubmit = async () => {
    // Run full validation before submit
    const allErrors = campsiteRows.map(validateRow);
    setRowErrors(allErrors);
    if (
      allErrors.some(
        (e) => e.latitude !== undefined || e.longitude !== undefined,
      )
    )
      return;

    const assets = campsiteRows.map((row, i) => {
      const campsiteNumber = highestNumber + i + 1;
      const tag = generateCampsiteId(campsiteNumber, recResourceId);
      const lat = row.latitude !== '' ? parseFloat(row.latitude) : undefined;
      const lng = row.longitude !== '' ? parseFloat(row.longitude) : undefined;
      return {
        rec_resource_id: recResourceId,
        asset_code: CAMPSITE_STRUCTURE_CODE,
        asset_name: `Campsite ${campsiteNumber}`,
        asset_tag: tag,
        parent_id: null,
        asset_length: null,
        asset_width: null,
        asset_area: null,
        actual_value: null,
        latitude: lat,
        longitude: lng,
        geometry_type_code: lat != null && lng != null ? 'PT' : undefined,
      };
    });

    await bulkCreate({ recResourceId, assets });
    handleClose();
    onCreate();
  };

  return (
    <BulkAddModalLayout
      show={show}
      title="Add campsites"
      onHide={handleClose}
      onShow={() => {
        setCampsiteRows([{ latitude: '', longitude: '' }]);
        setRowErrors([{}]);
      }}
      submitLabel={`Create ${quantity} campsite${quantity !== 1 ? 's' : ''}`}
      submitDisabled={quantity < 1 || hasErrors}
      isPending={isPending}
      onCancel={handleClose}
      onSubmit={handleSubmit}
    >
      {/* Section header */}
      <div className="bulk-modal__section-header">
        <h3 className="bulk-modal__subtitle">Campsite details</h3>
        <span className="bulk-modal__current-count">
          {existingCampsites.length} campsite
          {existingCampsites.length !== 1 ? 's' : ''} currently
        </span>
      </div>

      {/* Quantity stepper */}
      <NumberStepperInput value={quantity} onChange={updateQuantity} />

      {/* Preview */}
      {quantity > 0 && (
        <BulkCreationPreview
          heading={`Creating ${quantity} campsite${quantity !== 1 ? 's' : ''}`}
        >
          {campsiteRows.map((row, i) => {
            const campsiteNumber = highestNumber + i + 1;
            const errors = rowErrors[i] ?? {};
            return (
              <BulkAssetPreviewRow
                key={i}
                name={`Campsite ${campsiteNumber}`}
                showDivider={i < campsiteRows.length - 1}
              >
                <Row className="g-0">
                  <Col xs={12} md={6} className="bulk-modal__field-col">
                    <Form.Group controlId={`bulk-campsite-lat-${i}`}>
                      <Form.Label className="bulk-modal__field-label">
                        Latitude
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        min={-90}
                        max={90}
                        value={row.latitude}
                        onChange={(e) =>
                          updateRow(i, 'latitude', e.target.value)
                        }
                        isInvalid={!!errors.latitude}
                        className="bulk-modal__field-input"
                        placeholder="Optional (e.g. 49.94)"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.latitude}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className="bulk-modal__field-col">
                    <Form.Group controlId={`bulk-campsite-lng-${i}`}>
                      <Form.Label className="bulk-modal__field-label">
                        Longitude
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        min={-180}
                        max={180}
                        value={row.longitude}
                        onChange={(e) =>
                          updateRow(i, 'longitude', e.target.value)
                        }
                        isInvalid={!!errors.longitude}
                        className="bulk-modal__field-input"
                        placeholder="Optional (e.g. -123.04)"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.longitude}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </BulkAssetPreviewRow>
            );
          })}
        </BulkCreationPreview>
      )}
    </BulkAddModalLayout>
  );
}

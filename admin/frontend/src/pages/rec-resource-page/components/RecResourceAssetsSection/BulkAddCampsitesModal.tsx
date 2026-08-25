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
  };

  const updateRow = (
    index: number,
    field: keyof CampsiteRow,
    value: string,
  ) => {
    setCampsiteRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleClose = () => {
    setQuantity(1);
    setCampsiteRows([{ latitude: '', longitude: '' }]);
    onCancel();
  };

  const handleSubmit = async () => {
    const assets = campsiteRows.map((_, i) => {
      const campsiteNumber = highestNumber + i + 1;
      const tag = generateCampsiteId(campsiteNumber, recResourceId);
      return {
        rec_resource_id: recResourceId,
        asset_code: CAMPSITE_STRUCTURE_CODE,
        asset_name: `Campsite ${campsiteNumber}`,
        asset_tag: tag,
        parent_id: null,
        asset_length: null,
        asset_width: null,
        asset_area: null,
        default_value: null,
        actual_value: null,
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
      onShow={() => setCampsiteRows([{ latitude: '', longitude: '' }])}
      submitLabel={`Create ${quantity} campsite${quantity !== 1 ? 's' : ''}`}
      submitDisabled={quantity < 1}
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
            const campsiteId = generateCampsiteId(
              campsiteNumber,
              recResourceId,
            );
            return (
              <BulkAssetPreviewRow
                key={i}
                name={`Campsite ${campsiteNumber}`}
                id={campsiteId}
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
                        value={row.latitude}
                        onChange={(e) =>
                          updateRow(i, 'latitude', e.target.value)
                        }
                        className="bulk-modal__field-input"
                      />
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
                        value={row.longitude}
                        onChange={(e) =>
                          updateRow(i, 'longitude', e.target.value)
                        }
                        className="bulk-modal__field-input"
                      />
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

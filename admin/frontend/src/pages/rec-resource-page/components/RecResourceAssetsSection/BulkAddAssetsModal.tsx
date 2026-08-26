import { useState, useMemo } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';

import { HelpIcon } from '@/components';
import { useCreateBulkAssets } from '@/services/hooks/recreation-resource-admin';
import type { CreateRecreationAssetDto } from '@/services/recreation-resource-admin';
import type { Asset, AssetCode } from './types';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import {
  BulkAddModalLayout,
  BulkCreationPreview,
  BulkAssetPreviewRow,
  NumberStepperInput,
  validateCoordinateRow,
  type RowErrors,
} from './BulkAddModalShared';

interface BulkAddAssetsModalProps {
  show: boolean;
  recResourceId: string;
  assetCodes: AssetCode[];
  existingAssets: Asset[];
  onCancel: () => void;
  onCreate: () => void;
}

interface AssetRow {
  asset_comment: string;
  parent_id: number | null;
  latitude: string;
  longitude: string;
}

function generateAssetTag(
  description: string,
  index: number,
  recResourceId: string,
): string {
  const slug = description
    .trim()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-');
  const seq = String(index).padStart(2, '0');
  return `${slug}-${seq}-${recResourceId}`;
}

const EMPTY_ROW: AssetRow = {
  asset_comment: '',
  parent_id: null,
  latitude: '',
  longitude: '',
};

export function BulkAddAssetsModal({
  show,
  recResourceId,
  assetCodes,
  existingAssets,
  onCancel,
  onCreate,
}: BulkAddAssetsModalProps) {
  const [assetCode, setAssetCode] = useState<number | ''>('');
  const [assetLength, setAssetLength] = useState('');
  const [assetWidth, setAssetWidth] = useState('');
  const [assetArea, setAssetArea] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [assetRows, setAssetRows] = useState<AssetRow[]>([{ ...EMPTY_ROW }]);
  const [rowErrors, setRowErrors] = useState<RowErrors[]>([{}]);

  const { mutateAsync: bulkCreate, isPending } = useCreateBulkAssets();

  // Campsites available for assignment
  const campsites = useMemo(
    () =>
      existingAssets.filter((a) => a.asset_code === CAMPSITE_STRUCTURE_CODE),
    [existingAssets],
  );

  // Count of existing assets of the selected type (for sequential tag generation)
  const existingCountForType = useMemo(
    () =>
      assetCode !== ''
        ? existingAssets.filter((a) => a.asset_code === assetCode).length
        : 0,
    [existingAssets, assetCode],
  );

  const selectedAssetCode = assetCodes.find((c) => c.asset_code === assetCode);

  const lengthEnabled = selectedAssetCode?.has_length ?? false;
  const widthEnabled = selectedAssetCode?.has_width ?? false;
  const areaEnabled = selectedAssetCode?.has_area ?? false;

  // Sync rows when quantity changes
  const handleQuantityChange = (value: number) => {
    const qty = Math.max(1, Math.min(value, 100));
    setQuantity(qty);
    setAssetRows((prev) => {
      const updated = [...prev];
      while (updated.length < qty) updated.push({ ...EMPTY_ROW });
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
    field: keyof AssetRow,
    value: string | number | null,
  ) => {
    setAssetRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear the coordinate error for this field as soon as the user starts editing
    if (field === 'latitude' || field === 'longitude') {
      setRowErrors((errs) => {
        const updated = [...errs];
        updated[index] = { ...updated[index], [field]: undefined };
        return updated;
      });
    }
  };

  const handleClose = () => {
    setAssetCode('');
    setAssetLength('');
    setAssetWidth('');
    setAssetArea('');
    setActualValue('');
    setQuantity(1);
    setAssetRows([{ ...EMPTY_ROW }]);
    setRowErrors([{}]);
    onCancel();
  };

  const handleSubmit = async () => {
    if (assetCode === '') return;

    // Run full validation before submit
    const allErrors = assetRows.map(validateCoordinateRow);
    setRowErrors(allErrors);
    if (
      allErrors.some(
        (e) => e.latitude !== undefined || e.longitude !== undefined,
      )
    )
      return;

    const assets: CreateRecreationAssetDto[] = assetRows.map((row, i) => {
      const rowNumber = existingCountForType + i + 1;
      const displayName = selectedAssetCode?.description ?? 'Asset';
      const defaultName = `${displayName} ${rowNumber}`;
      const tag = generateAssetTag(
        selectedAssetCode?.description ?? String(assetCode),
        rowNumber,
        recResourceId,
      );
      const lat = row.latitude !== '' ? parseFloat(row.latitude) : undefined;
      const lng = row.longitude !== '' ? parseFloat(row.longitude) : undefined;
      return {
        rec_resource_id: recResourceId,
        asset_code: assetCode as number,
        asset_name: defaultName,
        asset_tag: tag,
        asset_comment: row.asset_comment || undefined,
        parent_id: (row.parent_id ?? undefined) as number | null | undefined,
        asset_length: assetLength ? parseFloat(assetLength) : undefined,
        asset_width: assetWidth ? parseFloat(assetWidth) : undefined,
        asset_area: assetArea ? parseFloat(assetArea) : undefined,
        actual_value: actualValue ? parseFloat(actualValue) : undefined,
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
      title="Add assets"
      onHide={handleClose}
      onShow={() => {
        setAssetRows([{ ...EMPTY_ROW }]);
        setRowErrors([{}]);
      }}
      submitLabel={`Create ${quantity} asset${quantity !== 1 ? 's' : ''}`}
      submitDisabled={assetCode === ''}
      isPending={isPending}
      onCancel={handleClose}
      onSubmit={handleSubmit}
    >
      <h3 className="bulk-modal__subtitle">Asset details</h3>

      <Row className="gy-3">
        <Col xs={12}>
          <Form.Group controlId="bulk-asset-type">
            <Form.Label>Asset type</Form.Label>
            <Form.Select
              value={assetCode}
              onChange={(e) => {
                const code = e.target.value ? Number(e.target.value) : '';
                setAssetCode(code);
                setAssetLength('');
                setAssetWidth('');
                setAssetArea('');
              }}
            >
              <option value="">Choose an asset type</option>
              {assetCodes
                .filter((code) => code.asset_code !== CAMPSITE_STRUCTURE_CODE)
                .map((code) => (
                  <option key={code.asset_code} value={code.asset_code}>
                    {code.description}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="bulk-asset-length">
            <Form.Label>Length (m)</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                value={assetLength}
                onChange={(e) => setAssetLength(e.target.value)}
                placeholder="0"
                disabled={!lengthEnabled}
              />
              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="bulk-asset-width">
            <Form.Label>Width (m)</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                value={assetWidth}
                onChange={(e) => setAssetWidth(e.target.value)}
                placeholder="0"
                disabled={!widthEnabled}
              />
              <InputGroup.Text>m</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="bulk-asset-area">
            <Form.Label>Area (m²)</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                min={0}
                value={assetArea}
                onChange={(e) => setAssetArea(e.target.value)}
                placeholder="0"
                disabled={!areaEnabled}
              />
              <InputGroup.Text>m²</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="bulk-asset-default-value">
            <Form.Label>
              Default value
              <HelpIcon
                id="bulk-default-value-help"
                text="Estimated replacement cost of asset using provincial standard rates."
              />
            </Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                value={
                  selectedAssetCode?.default_value != null
                    ? selectedAssetCode.default_value
                    : ''
                }
                placeholder="—"
                disabled
                readOnly
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="bulk-asset-actual-value">
            <Form.Label>
              Actual value
              <HelpIcon
                id="bulk-actual-value-help"
                text="Recorded value of asset based on actual purchase, construction, or donation values."
              />
            </Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                min={0}
                step="0.01"
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                placeholder="0.00"
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <NumberStepperInput
            value={quantity}
            onChange={handleQuantityChange}
          />
        </Col>
      </Row>

      {assetCode !== '' && assetRows.length > 0 && (
        <BulkCreationPreview
          heading={`Creating ${quantity} asset${quantity !== 1 ? 's' : ''}`}
        >
          {assetRows.map((row, i) => {
            const displayName = selectedAssetCode?.description ?? 'Asset';
            const rowNumber = existingCountForType + i + 1;
            const errors = rowErrors[i] ?? {};

            return (
              <BulkAssetPreviewRow
                key={i}
                name={`${displayName} ${rowNumber}`}
                id={generateAssetTag(
                  selectedAssetCode?.description ?? String(assetCode),
                  rowNumber,
                  recResourceId,
                )}
                showDivider={i < assetRows.length - 1}
              >
                <Row className="gy-2 gx-3">
                  <Col xs={12} sm={5}>
                    <Form.Group controlId={`bulk-asset-comment-${i}`}>
                      <Form.Label className="small">
                        Asset description
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={row.asset_comment}
                        onChange={(e) =>
                          updateRow(i, 'asset_comment', e.target.value)
                        }
                        placeholder="Optional description"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={4} sm>
                    <Form.Group controlId={`bulk-asset-campsite-${i}`}>
                      <Form.Label className="small">
                        Assign to campsite
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={row.parent_id ?? ''}
                        onChange={(e) =>
                          updateRow(
                            i,
                            'parent_id',
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">—</option>
                        {campsites.map((campsite) => (
                          <option
                            key={campsite.asset_id}
                            value={campsite.asset_id}
                          >
                            {campsite.asset_name ??
                              `Campsite ${campsite.asset_id}`}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={4} sm>
                    <Form.Group controlId={`bulk-asset-lat-${i}`}>
                      <Form.Label className="small">Latitude</Form.Label>
                      <Form.Control
                        size="sm"
                        type="number"
                        step="any"
                        min={-90}
                        max={90}
                        value={row.latitude}
                        onChange={(e) =>
                          updateRow(i, 'latitude', e.target.value)
                        }
                        isInvalid={!!errors.latitude}
                        placeholder="Optional"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.latitude}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col xs={4} sm>
                    <Form.Group controlId={`bulk-asset-lng-${i}`}>
                      <Form.Label className="small">Longitude</Form.Label>
                      <Form.Control
                        size="sm"
                        type="number"
                        step="any"
                        min={-180}
                        max={180}
                        value={row.longitude}
                        onChange={(e) =>
                          updateRow(i, 'longitude', e.target.value)
                        }
                        isInvalid={!!errors.longitude}
                        placeholder="Optional"
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

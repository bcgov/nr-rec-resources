import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import type { Asset } from './types';
import './AssetCardEditForm.scss';

interface AssetEditFormState {
  asset_name: string;
  asset_length: string;
  asset_width: string;
  asset_area: string;
  longitude: string;
  latitude: string;
  default_value: string;
  actual_value: string;
}

export interface AssetEditValues {
  asset_name: string | null;
  asset_length: number | null;
  asset_width: number | null;
  asset_area: number | null;
  longitude: number | null;
  latitude: number | null;
  default_value: number | null;
  actual_value: number | null;
}

interface AssetCardEditFormProps {
  asset: Asset;
  onChange: (assetId: number, values: AssetEditValues) => void;
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-') return null;
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}

function toFormString(value: number | null | undefined): string {
  return value != null ? String(value) : '';
}

export function AssetCardEditForm({ asset, onChange }: AssetCardEditFormProps) {
  const isCampsite = asset.asset_code === CAMPSITE_STRUCTURE_CODE;

  const [form, setForm] = useState<AssetEditFormState>({
    asset_name: asset.asset_name ?? '',
    asset_length: toFormString(asset.asset_length),
    asset_width: toFormString(asset.asset_width),
    asset_area: toFormString(asset.asset_area),
    longitude: toFormString(asset.longitude),
    latitude: toFormString(asset.latitude),
    default_value: toFormString(asset.default_value),
    actual_value: toFormString(asset.actual_value),
  });

  function handleChange(field: keyof AssetEditFormState, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(asset.asset_id, {
      asset_name: updated.asset_name || null,
      asset_length: parseNumber(updated.asset_length),
      asset_width: parseNumber(updated.asset_width),
      asset_area: parseNumber(updated.asset_area),
      longitude: parseNumber(updated.longitude),
      latitude: parseNumber(updated.latitude),
      default_value: parseNumber(updated.default_value),
      actual_value: parseNumber(updated.actual_value),
    });
  }

  const assetId = asset.asset_id;

  return (
    <div className="asset-card-edit-form">
      <Form.Group
        controlId={`asset-name-${assetId}`}
        className="asset-card-edit-form__name-group"
      >
        <Form.Label>Asset name</Form.Label>
        <Form.Control
          type="text"
          value={form.asset_name}
          onChange={(e) => handleChange('asset_name', e.target.value)}
        />
      </Form.Group>

      <div className="asset-card-edit-form__fields">
        {!isCampsite && (
          <Form.Group controlId={`asset-length-${assetId}`}>
            <Form.Label>Length</Form.Label>
            <div className="asset-card-edit-form__input-with-unit">
              <Form.Control
                type="number"
                value={form.asset_length}
                onChange={(e) => handleChange('asset_length', e.target.value)}
              />
              <span className="asset-card-edit-form__unit">m</span>
            </div>
          </Form.Group>
        )}

        {!isCampsite && (
          <Form.Group controlId={`asset-width-${assetId}`}>
            <Form.Label>Width</Form.Label>
            <div className="asset-card-edit-form__input-with-unit">
              <Form.Control
                type="number"
                value={form.asset_width}
                onChange={(e) => handleChange('asset_width', e.target.value)}
              />
              <span className="asset-card-edit-form__unit">m</span>
            </div>
          </Form.Group>
        )}

        {!isCampsite && (
          <Form.Group controlId={`asset-area-${assetId}`}>
            <Form.Label>Area</Form.Label>
            <div className="asset-card-edit-form__input-with-unit">
              <Form.Control
                type="number"
                value={form.asset_area}
                onChange={(e) => handleChange('asset_area', e.target.value)}
              />
              <span className="asset-card-edit-form__unit">m²</span>
            </div>
          </Form.Group>
        )}

        <Form.Group controlId={`asset-longitude-${assetId}`}>
          <Form.Label>Longitude</Form.Label>
          <Form.Control
            type="number"
            value={form.longitude}
            onChange={(e) => handleChange('longitude', e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId={`asset-latitude-${assetId}`}>
          <Form.Label>Latitude</Form.Label>
          <Form.Control
            type="number"
            value={form.latitude}
            onChange={(e) => handleChange('latitude', e.target.value)}
          />
        </Form.Group>

        {!isCampsite && (
          <Form.Group controlId={`asset-default-value-${assetId}`}>
            <Form.Label>Default Value</Form.Label>
            <div className="asset-card-edit-form__input-with-unit asset-card-edit-form__input-with-unit--prefix">
              <span className="asset-card-edit-form__unit asset-card-edit-form__unit--prefix">
                $
              </span>
              <Form.Control
                type="number"
                value={form.default_value}
                placeholder="–"
                onChange={(e) => handleChange('default_value', e.target.value)}
              />
            </div>
          </Form.Group>
        )}

        {!isCampsite && (
          <Form.Group controlId={`asset-actual-value-${assetId}`}>
            <Form.Label>Actual Value</Form.Label>
            <div className="asset-card-edit-form__input-with-unit asset-card-edit-form__input-with-unit--prefix">
              <span className="asset-card-edit-form__unit asset-card-edit-form__unit--prefix">
                $
              </span>
              <Form.Control
                type="number"
                value={form.actual_value}
                onChange={(e) => handleChange('actual_value', e.target.value)}
              />
            </div>
          </Form.Group>
        )}
      </div>
    </div>
  );
}

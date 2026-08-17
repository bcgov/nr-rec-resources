import { Card } from 'react-bootstrap';
import { formatDateReadable } from '@shared/utils';
import { AssetCardRepairs } from './AssetCardRepairs';
import { formatCurrency } from './formatCurrency';
import { getMockAssetRepairs } from './mockData';
import type { Asset } from './types';
import './AssetCard.scss';

interface AssetCardProps {
  asset: Asset;
  className?: string;
}

interface AssetField {
  label: string;
  value: string | null;
}

function getAssetFields(asset: Asset): AssetField[] {
  const fields: AssetField[] = [
    { label: 'Asset tag', value: asset.asset_tag },
    {
      label: 'Length',
      value: asset.asset_length != null ? String(asset.asset_length) : null,
    },
    {
      label: 'Width',
      value: asset.asset_width != null ? String(asset.asset_width) : null,
    },
    {
      label: 'Area',
      value: asset.asset_area != null ? String(asset.asset_area) : null,
    },
    {
      label: 'Default value',
      value:
        asset.default_value != null
          ? formatCurrency(asset.default_value)
          : null,
    },
    {
      label: 'Actual value',
      value:
        asset.actual_value != null ? formatCurrency(asset.actual_value) : null,
    },
    {
      label: 'Installation date',
      value: formatDateReadable(asset.installation_date),
    },
    { label: 'Legacy structure ID', value: asset.legacy_structure_id },
    { label: 'Comment', value: asset.asset_comment },
  ];

  return fields.filter((field) => !!field.value);
}

export function AssetCard({ asset, className = '' }: AssetCardProps) {
  const fields = getAssetFields(asset);
  const repairs = getMockAssetRepairs().filter(
    (repair) => repair.asset_id === asset.asset_id,
  );

  return (
    <Card className={`asset-card ${className}`}>
      <Card.Body>
        <div className="asset-card__header">
          <div className="d-flex justify-content-between align-items-center">
            <span className="asset-card__title">{asset.asset_name}</span>
          </div>
          {fields.length > 0 && (
            <div className="asset-card__fields">
              {fields.map((field) => (
                <span key={field.label} className="asset-card__field">
                  <span className="asset-card__field-label">
                    {field.label}:
                  </span>{' '}
                  {field.value}
                </span>
              ))}
            </div>
          )}
          <AssetCardRepairs repairs={repairs} />
        </div>
      </Card.Body>
    </Card>
  );
}

import { Card } from 'react-bootstrap';
import { AssetCardRepairs } from './AssetCardRepairs';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import { formatCurrency } from './formatCurrency';
import type { Asset, AssetCode, RepairCode } from './types';
import './AssetCard.scss';

interface AssetCardProps {
  asset: Asset;
  repairCodes: RepairCode[];
  assetCodes?: AssetCode[];
  className?: string;
  recResourceId?: string;
}

interface AssetField {
  label: string;
  value: string | null;
}

// Campsites don't have area/length/width or an outstanding-repair estimate,
// so their card shows a reduced field set.
const CAMPSITE_FIELD_LABELS = new Set(['Value', 'Repair spend', 'Location']);

function getAssetFields(asset: Asset, assetCodes: AssetCode[]): AssetField[] {
  const codeMap = new Map(assetCodes.map((c) => [c.asset_code, c]));
  const repairs = asset.recreation_asset_repair ?? [];
  const hasRepairs = repairs.length > 0;
  const value =
    asset.actual_value ?? codeMap.get(asset.asset_code)?.default_value;
  const repairSpend = hasRepairs
    ? repairs
        .filter((repair) => repair.repair_completed_date)
        .reduce(
          (sum, repair) =>
            sum +
            (repair.actual_repair_cost ?? repair.estimated_repair_cost ?? 0),
          0,
        )
    : null;
  const outstandingEstimate = hasRepairs
    ? repairs
        .filter((repair) => !repair.repair_completed_date)
        .reduce((sum, repair) => sum + (repair.estimated_repair_cost ?? 0), 0)
    : null;

  const fields: AssetField[] = [
    {
      label: 'Area',
      value: asset.asset_area != null ? String(asset.asset_area) : null,
    },
    {
      label: 'Length',
      value: asset.asset_length != null ? String(asset.asset_length) : null,
    },
    {
      label: 'Width',
      value: asset.asset_width != null ? String(asset.asset_width) : null,
    },
    {
      label: 'Value',
      value: value != null ? formatCurrency(value) : null,
    },
    {
      label: 'Repair spend',
      value: repairSpend != null ? formatCurrency(repairSpend) : null,
    },
    {
      label: 'Outstanding estimate',
      value:
        outstandingEstimate != null
          ? formatCurrency(outstandingEstimate)
          : null,
    },
    {
      label: 'Location',
      value:
        asset.latitude != null && asset.longitude != null
          ? `${asset.latitude},${asset.longitude}`
          : null,
    },
  ];

  const isCampsite = asset.asset_code === CAMPSITE_STRUCTURE_CODE;
  return isCampsite
    ? fields.filter((field) => CAMPSITE_FIELD_LABELS.has(field.label))
    : fields;
}

export function AssetCard({
  asset,
  repairCodes,
  assetCodes = [],
  className = '',
  recResourceId,
}: AssetCardProps) {
  const fields = getAssetFields(asset, assetCodes);
  const repairs = asset.recreation_asset_repair ?? [];

  return (
    <Card className={`asset-card ${className}`}>
      <Card.Body>
        <div className="asset-card__header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="asset-card__title">
              <span className="asset-card__title-name">{asset.asset_name}</span>
              {asset.asset_comment && (
                <span className="asset-card__comment">
                  {asset.asset_comment}
                </span>
              )}
            </div>
          </div>
          <div className="asset-card__fields">
            {fields.map((field) => (
              <span key={field.label} className="asset-card__field">
                <span className="asset-card__field-label">{field.label}:</span>{' '}
                {field.value ?? '-'}
              </span>
            ))}
          </div>
          <AssetCardRepairs
            repairs={repairs}
            repairCodes={repairCodes}
            assetId={asset.asset_id}
            recResourceId={recResourceId}
          />
        </div>
      </Card.Body>
    </Card>
  );
}

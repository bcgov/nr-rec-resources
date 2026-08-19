import { useId, useState } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import type { Asset, AssetCode } from './types';
import './RepairAssetEntry.scss';

interface AssetTypeOption {
  value: string;
  label: string;
}

interface RepairAssetEntryProps {
  assetCodes: AssetCode[];
  assets: Asset[];
  onRemove?: () => void;
}

export function RepairAssetEntry({
  assetCodes,
  assets,
  onRemove,
}: RepairAssetEntryProps) {
  const selectInputId = useId();
  const [selectedAssetCode, setSelectedAssetCode] = useState('');
  const [checkedAssetIds, setCheckedAssetIds] = useState<Set<number>>(
    new Set(),
  );

  const matchingAssets = selectedAssetCode
    ? assets
        .filter((asset) => String(asset.asset_code) === selectedAssetCode)
        .sort((a, b) => (a.asset_name ?? '').localeCompare(b.asset_name ?? ''))
    : [];

  const presentAssetCodes = new Set(assets.map((asset) => asset.asset_code));
  const assetTypeOptions: AssetTypeOption[] = assetCodes
    .filter((code) => presentAssetCodes.has(code.asset_code))
    .sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''))
    .map((code) => ({
      value: String(code.asset_code),
      label: code.description ?? String(code.asset_code),
    }));

  const toggleAsset = (assetId: number) => {
    setCheckedAssetIds((ids) => {
      const next = new Set(ids);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  return (
    <div className="repair-asset-entry">
      <h4 className="repair-asset-entry__title">Asset type</h4>
      <div className="repair-asset-entry__row">
        <Select<AssetTypeOption>
          inputId={selectInputId}
          aria-label="Asset type"
          className="repair-asset-entry__select"
          classNamePrefix="select"
          options={assetTypeOptions}
          placeholder="Select asset type..."
          value={
            assetTypeOptions.find(
              (option) => option.value === selectedAssetCode,
            ) ?? null
          }
          onChange={(selected) => setSelectedAssetCode(selected?.value ?? '')}
          isClearable
        />

        {onRemove && (
          <button
            type="button"
            className="btn repair-asset-entry__remove-btn"
            onClick={onRemove}
          >
            <FontAwesomeIcon icon={faXmark} className="me-1" />
            Remove
          </button>
        )}
      </div>

      {matchingAssets.length > 0 && (
        <div className="repair-asset-entry__assets">
          {matchingAssets.map((asset) => (
            <Form.Check
              key={asset.asset_id}
              type="checkbox"
              id={`repair-asset-entry-asset-${asset.asset_id}`}
              className="repair-asset-entry__asset"
              checked={checkedAssetIds.has(asset.asset_id)}
              onChange={() => toggleAsset(asset.asset_id)}
              label={asset.asset_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

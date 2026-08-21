import { useId } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Form, Row } from 'react-bootstrap';
import Select from 'react-select';
import { CurrencyInput } from '@/components/form';
import type { Asset, AssetCode } from './types';
import './RepairAssetEntry.scss';

interface AssetTypeOption {
  value: string;
  label: string;
}

// Asset type descriptions (rst.recreation_asset_code) that require per-trail
// start/end station coordinates when repaired.
const TRAIL_ASSET_TYPE_DESCRIPTIONS = new Set([
  'Trail',
  'Trail - Wheelchair Accessible',
]);

interface TrailStationState {
  startStation: string;
  endStation: string;
}

export interface RepairGroupFormState {
  id: number;
  assetTypeCode: string;
  selectedAssetIds: number[];
  estimatedCost: number | undefined;
  actualCost: number | undefined;
  trailStations: Record<number, TrailStationState>;
}

export function createRepairGroupFormState(id: number): RepairGroupFormState {
  return {
    id,
    assetTypeCode: '',
    selectedAssetIds: [],
    estimatedCost: undefined,
    actualCost: undefined,
    trailStations: {},
  };
}

// Shared with AddRepairModal so the "Create repairs" submit check and the
// submit payload builder both use exactly the same matching/selection logic
// this component renders.
export function getRepairGroupContext(
  entry: RepairGroupFormState,
  assets: Asset[],
  assetCodes: AssetCode[],
) {
  const matchingAssets = entry.assetTypeCode
    ? assets
        .filter((asset) => String(asset.asset_code) === entry.assetTypeCode)
        .sort((a, b) => (a.asset_name ?? '').localeCompare(b.asset_name ?? ''))
    : [];

  const selectedAssetIdSet = new Set(entry.selectedAssetIds);
  const selectedAssets = matchingAssets.filter((asset) =>
    selectedAssetIdSet.has(asset.asset_id),
  );

  const assetTypeDescription = assetCodes.find(
    (code) => String(code.asset_code) === entry.assetTypeCode,
  )?.description;
  const isTrailAssetType = Boolean(
    assetTypeDescription &&
      TRAIL_ASSET_TYPE_DESCRIPTIONS.has(assetTypeDescription),
  );

  return { matchingAssets, selectedAssets, isTrailAssetType };
}

// A group with no asset type selected yet has nothing to validate — there's
// no "Select assets" or "Repair cost" section rendered for it at all.
export function isRepairGroupValid(
  entry: RepairGroupFormState,
  assets: Asset[],
  assetCodes: AssetCode[],
): boolean {
  if (!entry.assetTypeCode) {
    return true;
  }

  const { selectedAssets, isTrailAssetType } = getRepairGroupContext(
    entry,
    assets,
    assetCodes,
  );

  if (selectedAssets.length === 0 || entry.estimatedCost === undefined) {
    return false;
  }

  if (isTrailAssetType) {
    return selectedAssets.every((asset) => {
      const station = entry.trailStations[asset.asset_id];
      return Boolean(
        station?.startStation.trim() && station?.endStation.trim(),
      );
    });
  }

  return true;
}

interface RepairAssetEntryProps {
  entry: RepairGroupFormState;
  assetCodes: AssetCode[];
  assets: Asset[];
  onChange: (patch: Partial<RepairGroupFormState>) => void;
  onRemove?: () => void;
  showErrors?: boolean;
}

export function RepairAssetEntry({
  entry,
  assetCodes,
  assets,
  onChange,
  onRemove,
  showErrors = false,
}: RepairAssetEntryProps) {
  const selectInputId = useId();

  const { matchingAssets, selectedAssets, isTrailAssetType } =
    getRepairGroupContext(entry, assets, assetCodes);
  const selectedAssetIds = new Set(entry.selectedAssetIds);

  const presentAssetCodes = new Set(assets.map((asset) => asset.asset_code));
  const assetTypeOptions: AssetTypeOption[] = assetCodes
    .filter((code) => presentAssetCodes.has(code.asset_code))
    .sort((a, b) => (a.description ?? '').localeCompare(b.description ?? ''))
    .map((code) => ({
      value: String(code.asset_code),
      label: code.description ?? String(code.asset_code),
    }));

  const noAssetsSelectedError = showErrors && selectedAssets.length === 0;
  const estimatedCostError = showErrors && entry.estimatedCost === undefined;

  const toggleAsset = (assetId: number) => {
    const next = new Set(entry.selectedAssetIds);
    if (next.has(assetId)) {
      next.delete(assetId);
    } else {
      next.add(assetId);
    }
    onChange({ selectedAssetIds: Array.from(next) });
  };

  const selectAllAssets = () => {
    onChange({
      selectedAssetIds: matchingAssets.map((asset) => asset.asset_id),
    });
  };

  const updateTrailStation = (
    assetId: number,
    field: keyof TrailStationState,
    value: string,
  ) => {
    const current = entry.trailStations[assetId] ?? {
      startStation: '',
      endStation: '',
    };
    onChange({
      trailStations: {
        ...entry.trailStations,
        [assetId]: { ...current, [field]: value },
      },
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
              (option) => option.value === entry.assetTypeCode,
            ) ?? null
          }
          onChange={(selected) =>
            onChange({
              assetTypeCode: selected?.value ?? '',
              selectedAssetIds: [],
              trailStations: {},
            })
          }
          isClearable
          // Portals the open menu out of the scrollable modal body — otherwise
          // it gets clipped by the `overflow-y: auto` ancestor.
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 1060 }) }}
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
        <>
          <div className="repair-asset-entry__assets-header">
            <h4 className="repair-asset-entry__title">
              Select assets ({selectedAssetIds.size} of {matchingAssets.length})
            </h4>
            <button
              type="button"
              className="btn repair-asset-entry__select-all-btn"
              onClick={selectAllAssets}
            >
              Select all
            </button>
          </div>
          <div className="repair-asset-entry__assets">
            {matchingAssets.map((asset) => (
              <Form.Check
                key={asset.asset_id}
                type="checkbox"
                id={`repair-asset-entry-asset-${asset.asset_id}`}
                className="repair-asset-entry__asset"
                checked={selectedAssetIds.has(asset.asset_id)}
                onChange={() => toggleAsset(asset.asset_id)}
                label={asset.asset_name}
              />
            ))}
          </div>
          {noAssetsSelectedError && (
            <div className="text-danger mt-2">
              Please select at least 1 asset
            </div>
          )}

          {isTrailAssetType && (
            <>
              <h4 className="repair-asset-entry__title repair-asset-entry__title--spaced">
                Trail repair coordinates
              </h4>
              {selectedAssets.length === 0 ? (
                <div className="repair-asset-entry__trail-empty">
                  Select a trail above to add repair coordinates.
                </div>
              ) : (
                selectedAssets.map((asset) => {
                  const station = entry.trailStations[asset.asset_id];
                  const startStationError =
                    showErrors && !station?.startStation.trim();
                  const endStationError =
                    showErrors && !station?.endStation.trim();

                  return (
                    <div
                      key={asset.asset_id}
                      className="repair-asset-entry__trail-row"
                    >
                      <div className="repair-asset-entry__trail-name">
                        {asset.asset_name}
                      </div>
                      <Row className="gy-3">
                        <Col xs={12} md={6}>
                          <Form.Group
                            controlId={`${selectInputId}-trail-${asset.asset_id}-start`}
                          >
                            <Form.Label className="repair-asset-entry__cost-label">
                              Start station
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. 49.232423, -128.334343"
                              isInvalid={startStationError}
                              value={station?.startStation ?? ''}
                              onChange={(e) =>
                                updateTrailStation(
                                  asset.asset_id,
                                  'startStation',
                                  e.target.value,
                                )
                              }
                            />
                            {startStationError && (
                              <Form.Control.Feedback
                                type="invalid"
                                className="d-block"
                              >
                                Start station is required
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group
                            controlId={`${selectInputId}-trail-${asset.asset_id}-end`}
                          >
                            <Form.Label className="repair-asset-entry__cost-label">
                              End station
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g. 49.234561, -128.331872"
                              isInvalid={endStationError}
                              value={station?.endStation ?? ''}
                              onChange={(e) =>
                                updateTrailStation(
                                  asset.asset_id,
                                  'endStation',
                                  e.target.value,
                                )
                              }
                            />
                            {endStationError && (
                              <Form.Control.Feedback
                                type="invalid"
                                className="d-block"
                              >
                                End station is required
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  );
                })
              )}
            </>
          )}

          <h4 className="repair-asset-entry__title repair-asset-entry__title--spaced">
            Repair cost
          </h4>
          <Row className="gy-3">
            <Col xs={12} md={6}>
              <Form.Group controlId={`${selectInputId}-estimated-cost`}>
                <Form.Label className="repair-asset-entry__cost-label">
                  Estimated repair cost per asset
                </Form.Label>
                <CurrencyInput
                  value={entry.estimatedCost}
                  onChange={(value) => onChange({ estimatedCost: value })}
                  isInvalid={estimatedCostError}
                />
                {estimatedCostError && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    Estimated repair cost is required
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId={`${selectInputId}-actual-cost`}>
                <Form.Label className="repair-asset-entry__cost-label">
                  Actual repair cost per asset (if applicable)
                </Form.Label>
                <CurrencyInput
                  value={entry.actualCost}
                  onChange={(value) => onChange({ actualCost: value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

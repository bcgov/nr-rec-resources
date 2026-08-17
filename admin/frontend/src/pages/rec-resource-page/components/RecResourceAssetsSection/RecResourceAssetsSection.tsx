import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Stack, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomButton } from '@/components';
import { AssetCard } from './AssetCard';
import { AssetSummaryCards } from './AssetSummaryCards';
import { AssetTypeCard } from './AssetTypeCard';
import { groupAssetsByType } from './assetTypeGrouping';
import { CampsiteCard } from './CampsiteCard';
import { groupAssetsByCampsite } from './campsiteGrouping';
import {
  MOCK_STRUCTURE_CODES,
  getMockAssetSummary,
  getMockAssets,
} from './mockData';
import assetType from '@shared/assets/icons/asset-type-outline.svg';
import campingType from '@shared/assets/icons/camping-type.svg';
import './RecResourceAssetsSection.scss';

type AssetGroupMode = 'type' | 'campsite';

export function RecResourceAssetsSection() {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const summary = getMockAssetSummary(recResourceId);
  const [groupMode, setGroupMode] = useState<AssetGroupMode>('type');
  const assets = getMockAssets(recResourceId);
  const typeGroups = groupAssetsByType(assets, MOCK_STRUCTURE_CODES);
  const campsiteGroups = groupAssetsByCampsite(assets);
  const hasCampsites = campsiteGroups.length > 0;

  return (
    <Stack direction="vertical" className="pb-4" gap={3}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Assets</h2>
      </div>

      <AssetSummaryCards summary={summary} />
      <div className="d-flex justify-content-between align-items-center gap-3 asset-summary-toolbar">
        <div className="d-flex align-items-center gap-2">
          <h3 className="asset-summary-heading mb-0">Asset summary</h3>
          {hasCampsites && (
            <ToggleButtonGroup
              type="radio"
              name="asset-group-mode"
              value={groupMode}
              onChange={(value: AssetGroupMode) => setGroupMode(value)}
            >
              <ToggleButton
                id="asset-group-mode-type"
                value="type"
                variant="outline-primary"
                size="sm"
                className="asset-group-toggle"
              >
                <img
                  alt=""
                  src={assetType}
                  height={16}
                  width={15}
                  className="me-2"
                />
                By type
              </ToggleButton>
              <ToggleButton
                id="asset-group-mode-campsite"
                value="campsite"
                variant="outline-primary"
                size="sm"
                className="asset-group-toggle"
              >
                <img
                  alt=""
                  src={campingType}
                  height={16}
                  width={15}
                  className="me-2"
                />
                By campsite
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 asset-summary-action-buttons">
          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn"
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Add repair
          </CustomButton>

          <CustomButton
            variant="primary"
            className="asset-summary-action-btn"
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Add campsite
          </CustomButton>
        </div>
      </div>

      {groupMode === 'type' && (
        <Stack direction="vertical" gap={3}>
          {typeGroups.map((group) => (
            <AssetTypeCard
              key={group.structureCode}
              eventKey={String(group.structureCode)}
              description={group.description}
              count={group.count}
              totalValue={group.totalValue}
            >
              <Stack direction="vertical" gap={2}>
                {group.assets.map((asset) => (
                  <AssetCard key={asset.asset_id} asset={asset} />
                ))}
              </Stack>
            </AssetTypeCard>
          ))}
        </Stack>
      )}

      {groupMode === 'campsite' && (
        <Stack direction="vertical" gap={3}>
          {campsiteGroups.map(({ campsite, children }) => (
            <CampsiteCard
              key={campsite.asset_id}
              eventKey={String(campsite.asset_id)}
              description={campsite.asset_name ?? ''}
              structureCount={children.length}
              totalValue={
                (campsite.actual_value ?? campsite.default_value ?? 0) +
                children.reduce(
                  (sum, child) =>
                    sum + (child.actual_value ?? child.default_value ?? 0),
                  0,
                )
              }
            >
              <Stack direction="vertical" gap={2}>
                <AssetCard asset={campsite} className="asset-card--campsite" />
                <div className="campsite-children">
                  <div className="campsite-children__divider" />
                  <Stack
                    direction="vertical"
                    gap={2}
                    className="campsite-children__list"
                  >
                    {children.map((child) => (
                      <AssetCard key={child.asset_id} asset={child} />
                    ))}
                  </Stack>
                </div>
              </Stack>
            </CampsiteCard>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

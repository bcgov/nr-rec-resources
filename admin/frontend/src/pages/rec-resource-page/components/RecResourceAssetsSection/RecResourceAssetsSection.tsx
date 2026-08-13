import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Stack, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomButton } from '@/components';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { AssetSummaryCards } from './AssetSummaryCards';
import { getMockAssetSummary } from './mockData';
import assetType from '@shared/assets/icons/asset-type-outline.svg';
import campingType from '@shared/assets/icons/camping-type.svg';
import './RecResourceAssetsSection.scss';

const INTERPRETIVE_FOREST_TYPE = 'interpretive forest';

type AssetGroupMode = 'type' | 'campsite';

export function RecResourceAssetsSection() {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const { recResource } = useRecResource();
  const summary = getMockAssetSummary(recResourceId);
  const isInterpretiveForest =
    recResource?.rec_resource_type?.toLowerCase() === INTERPRETIVE_FOREST_TYPE;
  const [groupMode, setGroupMode] = useState<AssetGroupMode>('type');

  return (
    <Stack direction="vertical" gap={3}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Assets</h2>
      </div>

      <AssetSummaryCards
        summary={summary}
        showStructuresCard={!isInterpretiveForest}
      />
      <div className="d-flex justify-content-between align-items-center gap-3 asset-summary-toolbar">
        <div className="d-flex align-items-center gap-2">
          <h3 className="asset-summary-heading mb-0">Asset summary</h3>
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
        </div>

        <div className="d-flex align-items-center gap-2 asset-summary-action-buttons">
          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn"
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Log repair
          </CustomButton>
          {groupMode === 'campsite' && (
            <CustomButton
              variant="primary"
              className="asset-summary-action-btn"
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
            >
              Add campsite
            </CustomButton>
          )}
        </div>
      </div>
    </Stack>
  );
}

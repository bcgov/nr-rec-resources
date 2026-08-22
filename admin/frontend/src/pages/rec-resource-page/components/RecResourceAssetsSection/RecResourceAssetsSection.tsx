import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  Spinner,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomButton } from '@/components';
import {
  useGetAssetCodes,
  useGetAssetsByRecResourceId,
  useGetRecreationResourceById,
  useGetRepairCodes,
} from '@/services/hooks/recreation-resource-admin';
import { AddRepairModal } from './AddRepairModal';
import { BulkAssetEditModal } from './BulkAssetEditModal';
import { AssetCard } from './AssetCard';
import { AssetSummaryCards } from './AssetSummaryCards';
import { AssetTypeCard } from './AssetTypeCard';
import { computeAssetSummary } from './assetSummary';
import { groupAssetsByType } from './assetTypeGrouping';
import { CampsiteCard } from './CampsiteCard';
import {
  CAMPSITE_STRUCTURE_CODE,
  groupAssetsByCampsite,
} from './campsiteGrouping';
import assetType from '@shared/assets/icons/asset-type-outline.svg';
import campingType from '@shared/assets/icons/camping-type.svg';
import './RecResourceAssetsSection.scss';

type AssetGroupMode = 'type' | 'campsite';

export function RecResourceAssetsSection() {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const [groupMode, setGroupMode] = useState<AssetGroupMode>('type');
  const [isAddRepairModalOpen, setIsAddRepairModalOpen] = useState(false);
  const [isBulkEditAssetModalOpen, setIsBulkEditAssetModalOpen] =
    useState(false);

  const {
    data: assets,
    isLoading: isAssetsLoading,
    isError: isAssetsError,
  } = useGetAssetsByRecResourceId(recResourceId);
  const { data: assetCodes } = useGetAssetCodes();
  const { data: repairCodes = [] } = useGetRepairCodes();
  const { data: resource } = useGetRecreationResourceById(recResourceId);

  const summary = computeAssetSummary(
    assets ?? [],
    resource?.last_rec_inspection_date ?? null,
    resource?.last_hzrd_tree_assess_date ?? null,
  );
  const typeGroups = groupAssetsByType(assets ?? [], assetCodes ?? []);
  const campsiteGroups = groupAssetsByCampsite(assets ?? []);
  const hasCampsites = campsiteGroups.length > 0;

  const openBulkEditModal = () => {
    setIsBulkEditAssetModalOpen(true);
  };

  return (
    <Stack direction="vertical" className="pb-4" gap={3}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Assets</h2>
      </div>
      <button onClick={() => openBulkEditModal()}>Bulk Edit Assets</button>
      <AssetSummaryCards summary={summary} />
      {isAssetsLoading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner
            animation="border"
            role="status"
            aria-label="Loading assets"
          />
        </div>
      ) : isAssetsError ? (
        <div className="text-muted py-3">
          Unable to load assets right now. Please try again later.
        </div>
      ) : (
        <>
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
                onClick={() => setIsAddRepairModalOpen(true)}
              >
                Add repair
              </CustomButton>
            </div>
          </div>

          {(assets ?? []).length === 0 && (
            <div className="asset-summary-empty">
              No assets recorded for this resource yet
            </div>
          )}

          {groupMode === 'type' && (
            <Stack direction="vertical" gap={3}>
              {typeGroups.map((group) => (
                <AssetTypeCard
                  key={group.structureCode}
                  eventKey={String(group.structureCode)}
                  description={group.description}
                  count={group.count}
                  totalValue={group.totalValue}
                  activeRepairsCount={group.activeRepairsCount}
                >
                  <Stack direction="vertical" gap={2}>
                    {group.assets.map((asset) => (
                      <AssetCard
                        key={asset.asset_id}
                        asset={asset}
                        repairCodes={repairCodes}
                      />
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
                    <AssetCard
                      asset={campsite}
                      repairCodes={repairCodes}
                      className="asset-card--campsite"
                    />
                    <div className="campsite-children">
                      <div className="campsite-children__divider" />
                      <Stack
                        direction="vertical"
                        gap={2}
                        className="campsite-children__list"
                      >
                        {children.map((child) => (
                          <AssetCard
                            key={child.asset_id}
                            asset={child}
                            repairCodes={repairCodes}
                          />
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </CampsiteCard>
              ))}
            </Stack>
          )}
        </>
      )}

      <AddRepairModal
        show={isAddRepairModalOpen}
        repairCodes={repairCodes}
        onCancel={() => setIsAddRepairModalOpen(false)}
        onCreate={() => setIsAddRepairModalOpen(false)}
      />
      <BulkAssetEditModal
        show={isBulkEditAssetModalOpen}
        rec_resource_id={recResourceId}
        assetTypes={typeGroups.filter(
          (group) => group.structureCode !== CAMPSITE_STRUCTURE_CODE,
        )}
        campsites={campsiteGroups}
        onCancel={() => setIsBulkEditAssetModalOpen(false)}
      />
    </Stack>
  );
}

import { useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  Dropdown,
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
  useUpdateAsset,
  useUpdateAssetRepair,
} from '@/services/hooks/recreation-resource-admin';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import { ROUTE_PATHS } from '@/constants/routes';
import { AssetCard } from './components/RecResourceAssetsSection/AssetCard';
import { AssetCardEdit } from './components/RecResourceAssetsSection/AssetCardEdit';
import { AssetSummaryCards } from './components/RecResourceAssetsSection/AssetSummaryCards';
import { AssetTypeCard } from './components/RecResourceAssetsSection/AssetTypeCard';
import { AssetTypeCardEdit } from './components/RecResourceAssetsSection/AssetTypeCardEdit';
import { computeAssetSummary } from './components/RecResourceAssetsSection/assetSummary';
import { groupAssetsByType } from './components/RecResourceAssetsSection/assetTypeGrouping';
import { groupAssetsByCampsite } from './components/RecResourceAssetsSection/campsiteGrouping';
import assetType from '@shared/assets/icons/asset-type-outline.svg';
import campingType from '@shared/assets/icons/camping-type.svg';
import type { AssetEditFormValues } from './components/RecResourceAssetsSection/AssetCardEdit';

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = parseFloat(trimmed);
  return isNaN(n) ? null : n;
}

export function RecResourceAssetsEditPage() {
  const { id: recResourceId } = useParams({ from: '/rec-resource/$id' });
  const search = useSearch({ from: '/rec-resource/$id/assets/edit' });
  const navigate = useNavigate();

  // editGroup is the structureCode of the group currently in edit mode
  const editGroup: string | undefined = (search as Record<string, string>)
    .editGroup;

  const {
    data: assets,
    isLoading: isAssetsLoading,
    isError: isAssetsError,
  } = useGetAssetsByRecResourceId(recResourceId);
  const { data: assetCodes } = useGetAssetCodes();
  const { data: repairCodes = [] } = useGetRepairCodes();
  const { data: resource } = useGetRecreationResourceById(recResourceId);
  const { mutateAsync: updateAsset } = useUpdateAsset();
  const { mutateAsync: updateRepair } = useUpdateAssetRepair();

  const [pendingChanges, setPendingChanges] = useState<
    Map<number, AssetEditFormValues>
  >(new Map());
  const [pendingRepairChanges, setPendingRepairChanges] = useState<
    Map<number, Partial<UpdateRecreationAssetRepairDto>>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const summary = computeAssetSummary(
    assets ?? [],
    resource?.last_rec_inspection_date ?? null,
    resource?.last_hzrd_tree_assess_date ?? null,
  );
  const typeGroups = groupAssetsByType(assets ?? [], assetCodes ?? []);
  const campsiteGroups = groupAssetsByCampsite(assets ?? []);
  const hasCampsites = campsiteGroups.length > 0;

  function handleEditChange(assetId: number, values: AssetEditFormValues) {
    setPendingChanges((prev) => new Map(prev).set(assetId, values));
  }

  function handleRepairChange(
    repairId: number,
    dto: Partial<UpdateRecreationAssetRepairDto>,
  ) {
    setPendingRepairChanges((prev) => {
      const updated = new Map(prev);
      updated.set(repairId, { ...updated.get(repairId), ...dto });
      return updated;
    });
  }

  function navigateToView() {
    void navigate({
      to: ROUTE_PATHS.REC_RESOURCE_ASSETS,
      params: { id: recResourceId },
    });
  }

  async function handleSave() {
    if (!recResourceId) return;
    setIsSaving(true);
    try {
      await Promise.all([
        ...Array.from(pendingChanges.entries()).map(([assetId, values]) =>
          updateAsset({
            assetId,
            recResourceId,
            dto: {
              asset_name: values.asset_name || null,
              asset_length: parseNumber(values.asset_length),
              asset_width: parseNumber(values.asset_width),
              asset_area: parseNumber(values.asset_area),
              actual_value: parseNumber(values.actual_value),
            },
          }),
        ),
        ...Array.from(pendingRepairChanges.entries()).map(([repairId, dto]) =>
          updateRepair({ repairId, recResourceId, dto }),
        ),
      ]);
      navigateToView();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack direction="vertical" className="pb-4" gap={3}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Assets</h2>
        <Dropdown>
          <Dropdown.Toggle
            variant="primary"
            id="assets-actions-dropdown"
            disabled
          >
            Actions
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" />
        </Dropdown>
      </div>

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
                  value="type"
                  onChange={() => {}}
                >
                  <ToggleButton
                    id="asset-group-mode-type"
                    value="type"
                    variant="outline-primary"
                    size="sm"
                    className="asset-group-toggle"
                    disabled
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
                    disabled
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
                leftIcon={<FontAwesomeIcon icon={faPlus as any} />}
                disabled
              >
                Add repair
              </CustomButton>
            </div>
          </div>

          <Stack direction="vertical" gap={3}>
            {typeGroups.map((group) => {
              const groupKey = String(group.structureCode);
              const isEditing = editGroup === groupKey;

              if (isEditing) {
                return (
                  <AssetTypeCardEdit
                    key={groupKey}
                    eventKey={groupKey}
                    description={group.description}
                    count={group.count}
                    totalValue={group.totalValue}
                    activeRepairsCount={group.activeRepairsCount}
                    onCancel={navigateToView}
                    onSave={handleSave}
                    isSaving={isSaving}
                  >
                    <Stack direction="vertical" gap={2}>
                      {group.assets.map((asset) => (
                        <AssetCardEdit
                          key={asset.asset_id}
                          asset={asset}
                          repairCodes={repairCodes}
                          assetCodes={assetCodes ?? []}
                          recResourceId={recResourceId}
                          onChange={handleEditChange}
                          onRepairChange={handleRepairChange}
                        />
                      ))}
                    </Stack>
                  </AssetTypeCardEdit>
                );
              }

              return (
                <AssetTypeCard
                  key={groupKey}
                  eventKey={groupKey}
                  description={group.description}
                  count={group.count}
                  totalValue={group.totalValue}
                  activeRepairsCount={group.activeRepairsCount}
                  isDisabled={!!editGroup}
                  onEdit={() =>
                    void navigate({
                      to: ROUTE_PATHS.REC_RESOURCE_ASSETS_EDIT,
                      params: { id: recResourceId },
                      search: { editGroup: groupKey },
                    })
                  }
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
              );
            })}
          </Stack>
        </>
      )}
    </Stack>
  );
}

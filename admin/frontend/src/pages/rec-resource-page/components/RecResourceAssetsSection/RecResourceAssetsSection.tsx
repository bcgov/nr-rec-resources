import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
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
  useUpdateRecreationResource,
} from '@/services/hooks/recreation-resource-admin';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { ROUTE_PATHS } from '@/constants/routes';
import { parseNumber, toDateInputValue } from '@/utils/assetForm';
import { buildAssetUpdateDto, buildInspectionDatesDto } from './editPayloads';
import { AddRepairModal } from './AddRepairModal';
import { BulkAssetEditModal } from './BulkAssetEditModal';
import { AssetCard } from './AssetCard';
import { AssetCardEdit } from './AssetCardEdit';
import type { AssetEditFormValues } from './AssetCardEdit';
import { AssetSummaryCards } from './AssetSummaryCards';
import { AssetTypeCard } from './AssetTypeCard';
import { BulkAddAssetsModal } from './BulkAddAssetsModal';
import { BulkAddCampsitesModal } from './BulkAddCampsitesModal';
import { computeAssetSummary } from './assetSummary';
import { groupAssetsByType } from './assetTypeGrouping';
import { CampsiteCard } from './CampsiteCard';
import { InspectionDatesEdit } from './InspectionDatesEdit';
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
  const navigate = useNavigate();
  const [groupMode, setGroupMode] = useState<AssetGroupMode>('type');
  const [isAddRepairModalOpen, setIsAddRepairModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isBulkAddCampsitesModalOpen, setIsBulkAddCampsitesModalOpen] =
    useState(false);
  const [isBulkEditAssetModalOpen, setIsBulkEditAssetModalOpen] =
    useState(false);

  // Inline campsite editing state
  const [editingCampsiteId, setEditingCampsiteId] = useState<number | null>(
    null,
  );
  const [pendingChanges, setPendingChanges] = useState<
    Map<number, AssetEditFormValues>
  >(new Map());
  const [pendingRepairChanges, setPendingRepairChanges] = useState<
    Map<number, Partial<UpdateRecreationAssetRepairDto>>
  >(new Map());
  const [isSavingCampsite, setIsSavingCampsite] = useState(false);
  const [assetValidationErrors, setAssetValidationErrors] = useState<
    Map<number, boolean>
  >(new Map());

  // Inspection edit state
  const [isInspectionEditOpen, setIsInspectionEditOpen] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [dangerTreeDate, setDangerTreeDate] = useState('');
  const [isSavingInspections, setIsSavingInspections] = useState(false);

  const {
    data: assets,
    isLoading: isAssetsLoading,
    isError: isAssetsError,
  } = useGetAssetsByRecResourceId(recResourceId);
  const { data: assetCodes = [] } = useGetAssetCodes();
  const { data: repairCodes = [] } = useGetRepairCodes();
  const { data: resource } = useGetRecreationResourceById(recResourceId);
  const { mutateAsync: updateResource } = useUpdateRecreationResource();
  const { mutateAsync: updateAsset } = useUpdateAsset();
  const { mutateAsync: updateRepair } = useUpdateAssetRepair();

  const summaryInspectionDate = inspectionDate
    ? new Date(inspectionDate)
    : (resource?.last_rec_inspection_date ?? null);
  const summaryDangerTreeDate = dangerTreeDate
    ? new Date(dangerTreeDate)
    : (resource?.last_hzrd_tree_assess_date ?? null);

  const summary = computeAssetSummary(
    assets ?? [],
    summaryInspectionDate,
    summaryDangerTreeDate,
    assetCodes,
  );
  const typeGroups = groupAssetsByType(assets ?? [], assetCodes ?? []);
  const campsiteGroups = groupAssetsByCampsite(assets ?? []);
  const hasCampsites = campsiteGroups.length > 0;
  const codeMap = new Map((assetCodes ?? []).map((c) => [c.asset_code, c]));

  function handleEditChange(assetId: number, values: AssetEditFormValues) {
    setPendingChanges((prev) => new Map(prev).set(assetId, values));
  }

  function handleValidationChange(assetId: number, hasErrors: boolean) {
    setAssetValidationErrors((prev) => {
      const updated = new Map(prev);
      updated.set(assetId, hasErrors);
      return updated;
    });
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

  function handleCancelCampsiteEdit() {
    setEditingCampsiteId(null);
    setPendingChanges(new Map());
    setPendingRepairChanges(new Map());
    setAssetValidationErrors(new Map());
  }

  async function handleSaveCampsiteEdit() {
    // Block save if any asset has validation errors
    if (Array.from(assetValidationErrors.values()).some(Boolean)) {
      addErrorNotification(
        'Please fix validation errors before saving.',
        'saveCampsite-validation',
      );
      return;
    }

    // Also validate lat/lng from pending changes directly
    for (const [, values] of pendingChanges) {
      const lat = parseNumber(values.latitude);
      const lng = parseNumber(values.longitude);
      if (lat !== null && (lat < -90 || lat > 90)) {
        addErrorNotification(
          'Latitude must be between -90 and 90.',
          'saveCampsite-lat-error',
        );
        return;
      }
      if (lng !== null && (lng < -180 || lng > 180)) {
        addErrorNotification(
          'Longitude must be between -180 and 180.',
          'saveCampsite-lng-error',
        );
        return;
      }
      if ((lat !== null) !== (lng !== null)) {
        addErrorNotification(
          'Both latitude and longitude must be set together.',
          'saveCampsite-latlng-error',
        );
        return;
      }
    }

    setIsSavingCampsite(true);
    try {
      await Promise.all([
        ...Array.from(pendingChanges.entries()).map(([assetId, values]) => {
          const lat = parseNumber(values.latitude);
          const lng = parseNumber(values.longitude);
          const hasBoth = lat !== null && lng !== null;
          return updateAsset({
            assetId,
            recResourceId,
            dto: {
              ...buildAssetUpdateDto(values),
              latitude: lat ?? null,
              longitude: lng ?? null,
              geometry_type_code: hasBoth ? 'PT' : null,
            },
          });
        }),
        ...Array.from(pendingRepairChanges.entries()).map(([repairId, dto]) =>
          updateRepair({ repairId, recResourceId, dto }),
        ),
      ]);
      addSuccessNotification(
        'Campsite assets updated successfully.',
        'saveCampsite-success',
      );
      setEditingCampsiteId(null);
      setPendingChanges(new Map());
      setPendingRepairChanges(new Map());
      setAssetValidationErrors(new Map());
    } catch {
      addErrorNotification(
        'Failed to save campsite changes. Please try again.',
        'saveCampsite-error',
      );
    } finally {
      setIsSavingCampsite(false);
    }
  }

  useEffect(() => {
    setInspectionDate(toDateInputValue(resource?.last_rec_inspection_date));
    setDangerTreeDate(toDateInputValue(resource?.last_hzrd_tree_assess_date));
  }, [
    resource?.last_rec_inspection_date,
    resource?.last_hzrd_tree_assess_date,
  ]);

  async function handleSaveInspections() {
    if (!recResourceId) return;
    setIsSavingInspections(true);
    try {
      await updateResource({
        recResourceId,
        updateRecreationResourceDto: buildInspectionDatesDto(
          inspectionDate,
          dangerTreeDate,
        ),
      });
      addSuccessNotification(
        'Inspection dates updated successfully.',
        'updateInspections-success',
      );
      setIsInspectionEditOpen(false);
    } catch {
      addErrorNotification(
        'Failed to update inspection dates. Please try again.',
        'updateInspections-error',
      );
    } finally {
      setIsSavingInspections(false);
    }
  }

  function handleCancelInspections() {
    setInspectionDate(toDateInputValue(resource?.last_rec_inspection_date));
    setDangerTreeDate(toDateInputValue(resource?.last_hzrd_tree_assess_date));
    setIsInspectionEditOpen(false);
  }

  return (
    <Stack direction="vertical" className="pb-4" gap={3}>
      <div className="d-flex justify-content-between align-items-center gap-3">
        <h2 className="mb-0">Assets</h2>
        <div className="d-flex align-items-center gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="assets-actions-dropdown">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => setIsBulkEditAssetModalOpen(true)}>
                Update assets
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setIsBulkAddModalOpen(true)}>
                Add assets
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setIsBulkAddCampsitesModalOpen(true)}
              >
                Add campsites
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => setIsInspectionEditOpen(true)}
                disabled={isInspectionEditOpen}
              >
                Edit inspection dates
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {isInspectionEditOpen && (
        <InspectionDatesEdit
          currentInspectionDate={resource?.last_rec_inspection_date}
          currentDangerTreeDate={resource?.last_hzrd_tree_assess_date}
          inspectionDate={inspectionDate}
          dangerTreeDate={dangerTreeDate}
          isSaving={isSavingInspections}
          onInspectionDateChange={setInspectionDate}
          onDangerTreeDateChange={setDangerTreeDate}
          onSave={() => void handleSaveInspections()}
          onCancel={handleCancelInspections}
        />
      )}

      <AssetSummaryCards summary={summary} isLoading={isAssetsLoading} />

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
                leftIcon={<FontAwesomeIcon icon={faPlus as any} />}
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
                  onEdit={() =>
                    void navigate({
                      to: ROUTE_PATHS.REC_RESOURCE_ASSETS_EDIT,
                      params: { id: recResourceId },
                      search: { editGroup: String(group.structureCode) },
                    })
                  }
                >
                  <Stack direction="vertical" gap={2}>
                    {group.assets.map((asset) => (
                      <AssetCard
                        key={asset.asset_id}
                        asset={asset}
                        repairCodes={repairCodes}
                        recResourceId={recResourceId}
                        assetCodes={assetCodes}
                      />
                    ))}
                  </Stack>
                </AssetTypeCard>
              ))}
            </Stack>
          )}

          {groupMode === 'campsite' && (
            <Stack direction="vertical" gap={3}>
              {campsiteGroups.map(({ campsite, children }) => {
                const isEditing = editingCampsiteId === campsite.asset_id;
                return (
                  <CampsiteCard
                    key={campsite.asset_id}
                    eventKey={String(campsite.asset_id)}
                    description={campsite.asset_name ?? ''}
                    structureCount={children.length}
                    totalValue={
                      (campsite.actual_value ??
                        codeMap.get(campsite.asset_code)?.default_value ??
                        0) +
                      children.reduce(
                        (sum, child) =>
                          sum +
                          (child.actual_value ??
                            codeMap.get(child.asset_code)?.default_value ??
                            0),
                        0,
                      )
                    }
                    isEditing={isEditing}
                    isSaving={isSavingCampsite}
                    isDisabled={editingCampsiteId !== null && !isEditing}
                    onEdit={() => setEditingCampsiteId(campsite.asset_id)}
                    onSave={() => void handleSaveCampsiteEdit()}
                    onCancel={handleCancelCampsiteEdit}
                  >
                    <Stack direction="vertical" gap={2}>
                      {isEditing ? (
                        <>
                          <AssetCardEdit
                            asset={campsite}
                            repairCodes={repairCodes}
                            assetCodes={assetCodes}
                            className="asset-card--campsite"
                            recResourceId={recResourceId}
                            onChange={handleEditChange}
                            onValidationChange={handleValidationChange}
                            onRepairChange={handleRepairChange}
                          />
                          <div className="campsite-children">
                            <div className="campsite-children__divider" />
                            <Stack
                              direction="vertical"
                              gap={2}
                              className="campsite-children__list"
                            >
                              {children.map((child) => (
                                <AssetCardEdit
                                  key={child.asset_id}
                                  asset={child}
                                  repairCodes={repairCodes}
                                  assetCodes={assetCodes}
                                  recResourceId={recResourceId}
                                  onChange={handleEditChange}
                                  onValidationChange={handleValidationChange}
                                  onRepairChange={handleRepairChange}
                                />
                              ))}
                            </Stack>
                          </div>
                        </>
                      ) : (
                        <>
                          <AssetCard
                            asset={campsite}
                            repairCodes={repairCodes}
                            assetCodes={assetCodes}
                            className="asset-card--campsite"
                            recResourceId={recResourceId}
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
                                  assetCodes={assetCodes}
                                  recResourceId={recResourceId}
                                />
                              ))}
                            </Stack>
                          </div>
                        </>
                      )}
                    </Stack>
                  </CampsiteCard>
                );
              })}
            </Stack>
          )}
        </>
      )}

      <AddRepairModal
        show={isAddRepairModalOpen}
        recResourceId={recResourceId}
        repairCodes={repairCodes}
        assetCodes={assetCodes ?? []}
        assets={assets ?? []}
        onCancel={() => setIsAddRepairModalOpen(false)}
        onCreate={() => setIsAddRepairModalOpen(false)}
      />

      <BulkAddAssetsModal
        show={isBulkAddModalOpen}
        recResourceId={recResourceId}
        assetCodes={assetCodes}
        existingAssets={assets ?? []}
        onCancel={() => setIsBulkAddModalOpen(false)}
        onCreate={() => setIsBulkAddModalOpen(false)}
      />

      <BulkAddCampsitesModal
        show={isBulkAddCampsitesModalOpen}
        recResourceId={recResourceId}
        existingAssets={assets ?? []}
        onCancel={() => setIsBulkAddCampsitesModalOpen(false)}
        onCreate={() => setIsBulkAddCampsitesModalOpen(false)}
      />

      <BulkAssetEditModal
        show={isBulkEditAssetModalOpen}
        rec_resource_id={recResourceId}
        assetTypes={typeGroups.filter(
          (group) => group.structureCode !== CAMPSITE_STRUCTURE_CODE,
        )}
        assetCodes={assetCodes}
        campsites={campsiteGroups}
        onCancel={() => setIsBulkEditAssetModalOpen(false)}
      />
    </Stack>
  );
}

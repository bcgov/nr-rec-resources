import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Form, InputGroup, Button } from 'react-bootstrap';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal/DeleteConfirmationModal';
import { AssetCardRepairsEdit } from './AssetCardRepairsEdit';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import type { Asset, AssetCode, RepairCode } from './types';
import type { UpdateRecreationAssetRepairDto } from '@/services/recreation-resource-admin';
import './AssetCard.scss';
import './AssetCardEdit.scss';
import {
  latitudeRegisterOptions,
  longitudeRegisterOptions,
} from './coordinateRegisterOptions';

export interface AssetEditFormValues {
  asset_comment: string;
  asset_length: string;
  asset_width: string;
  asset_area: string;
  longitude: string;
  latitude: string;
  actual_value: string;
}

interface AssetCardEditProps {
  asset: Asset;
  repairCodes: RepairCode[];
  assetCodes?: AssetCode[];
  className?: string;
  recResourceId: string;
  onChange: (assetId: number, values: AssetEditFormValues) => void;
  onValidationChange?: (assetId: number, hasErrors: boolean) => void;
  onRepairChange?: (
    repairId: number,
    dto: Partial<UpdateRecreationAssetRepairDto>,
  ) => void;
  onDelete?: (assetId: number) => void;
}

export function AssetCardEdit({
  asset,
  repairCodes,
  assetCodes = [],
  className = '',
  recResourceId,
  onChange,
  onValidationChange,
  onRepairChange,
  onDelete,
}: AssetCardEditProps) {
  const isCampsite = asset.asset_code === CAMPSITE_STRUCTURE_CODE;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedAssetCode = assetCodes.find(
    (c) => c.asset_code === asset.asset_code,
  );
  const lengthEnabled = selectedAssetCode?.has_length ?? false;
  const widthEnabled = selectedAssetCode?.has_width ?? false;
  const areaEnabled = selectedAssetCode?.has_area ?? false;
  const repairs = asset.recreation_asset_repair ?? [];
  const assetName = asset.asset_name?.trim() || 'this asset';

  const {
    register,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<AssetEditFormValues>({
    mode: 'onChange',
    defaultValues: {
      asset_comment: asset.asset_comment ?? '',
      asset_length:
        asset.asset_length != null ? String(asset.asset_length) : '',
      asset_width: asset.asset_width != null ? String(asset.asset_width) : '',
      asset_area: asset.asset_area != null ? String(asset.asset_area) : '',
      longitude: asset.longitude != null ? String(asset.longitude) : '',
      latitude: asset.latitude != null ? String(asset.latitude) : '',
      actual_value:
        asset.actual_value != null ? String(asset.actual_value) : '',
    },
  });

  function handleChange() {
    const values = getValues();
    onChange(asset.asset_id, values);
    // Re-validate lat/lng together (one required if other is set)
    void trigger(['latitude', 'longitude']);
    const hasErrors = Object.keys(errors).length > 0;
    onValidationChange?.(asset.asset_id, hasErrors);
  }

  const id = asset.asset_id;

  return (
    <>
      <Card className={`asset-card ${className}`}>
        <Card.Body>
          <div className="asset-card__header asset-card-edit__body">
            <div className="asset-card-edit__header-row">
              <h3 className="asset-card-edit__title">{asset.asset_name}</h3>
              {onDelete && (
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  className="asset-card-edit__delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              )}
            </div>

            <Form.Group
              controlId={`asset-comment-${id}`}
              className="asset-card-edit__name-group"
            >
              <Form.Label>Asset description</Form.Label>
              <Form.Control
                type="text"
                {...register('asset_comment')}
                onChange={(e) => {
                  void register('asset_comment').onChange(e);
                  handleChange();
                }}
              />
            </Form.Group>

            <div className="asset-card-edit__fields">
              {!isCampsite && (
                <Form.Group controlId={`asset-length-${id}`}>
                  <Form.Label>Length</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      {...register('asset_length')}
                      disabled={!lengthEnabled}
                      onChange={(e) => {
                        void register('asset_length').onChange(e);
                        handleChange();
                      }}
                    />
                    <InputGroup.Text>m</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              )}

              {!isCampsite && (
                <Form.Group controlId={`asset-width-${id}`}>
                  <Form.Label>Width</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      {...register('asset_width')}
                      disabled={!widthEnabled}
                      onChange={(e) => {
                        void register('asset_width').onChange(e);
                        handleChange();
                      }}
                    />
                    <InputGroup.Text>m</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              )}

              {!isCampsite && (
                <Form.Group controlId={`asset-area-${id}`}>
                  <Form.Label>Area</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      {...register('asset_area')}
                      disabled={!areaEnabled}
                      onChange={(e) => {
                        void register('asset_area').onChange(e);
                        handleChange();
                      }}
                    />
                    <InputGroup.Text>
                      m<sup>2</sup>
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              )}

              <Form.Group controlId={`asset-longitude-${id}`}>
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  isInvalid={!!errors.longitude}
                  {...register('longitude', longitudeRegisterOptions(getValues))}
                  onChange={(e) => {
                    void register('longitude').onChange(e);
                    handleChange();
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.longitude?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId={`asset-latitude-${id}`}>
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  isInvalid={!!errors.latitude}
                  {...register('latitude', latitudeRegisterOptions(getValues))}
                  onChange={(e) => {
                    void register('latitude').onChange(e);
                    handleChange();
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.latitude?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {!isCampsite && (
                <Form.Group controlId={`asset-default-value-${id}`}>
                  <Form.Label>Default Value</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>

                    <Form.Control
                      type="number"
                      step="any"
                      disabled
                      value={selectedAssetCode?.default_value ?? ''}
                    />
                  </InputGroup>
                </Form.Group>
              )}

              {!isCampsite && (
                <Form.Group controlId={`asset-actual-value-${id}`}>
                  <Form.Label>Actual Value</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="any"
                      {...register('actual_value')}
                      onChange={(e) => {
                        void register('actual_value').onChange(e);
                        handleChange();
                      }}
                    />
                  </InputGroup>
                </Form.Group>
              )}
            </div>

            {repairs.length > 0 && (
              <AssetCardRepairsEdit
                assetId={asset.asset_id}
                repairs={repairs}
                repairCodes={repairCodes}
                onChange={onRepairChange}
              />
            )}
          </div>
        </Card.Body>
      </Card>

      {onDelete && (
        <DeleteConfirmationModal
          show={showDeleteConfirm}
          title="Delete asset?"
          description={
            <>
              Are you sure you want to delete <strong>{assetName}</strong>?
            </>
          }
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete(asset.asset_id);
          }}
          confirmText="Delete"
          confirmVariant="outline-primary"
        />
      )}
    </>
  );
}

import { useForm } from 'react-hook-form';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { AssetCardRepairsEdit } from './AssetCardRepairsEdit';
import { CAMPSITE_STRUCTURE_CODE } from './campsiteGrouping';
import type { Asset, AssetCode, RepairCode } from './types';
import './AssetCard.scss';
import './AssetCardEdit.scss';

export interface AssetEditFormValues {
  asset_name: string;
  asset_length: string;
  asset_width: string;
  asset_area: string;
  longitude: string;
  latitude: string;
  default_value: string;
  actual_value: string;
}

interface AssetCardEditProps {
  asset: Asset;
  repairCodes: RepairCode[];
  assetCodes?: AssetCode[];
  className?: string;
  recResourceId: string;
  onChange: (assetId: number, values: AssetEditFormValues) => void;
}

export function AssetCardEdit({
  asset,
  repairCodes,
  assetCodes = [],
  className = '',
  recResourceId,
  onChange,
}: AssetCardEditProps) {
  const isCampsite = asset.asset_code === CAMPSITE_STRUCTURE_CODE;

  const selectedAssetCode = assetCodes.find(
    (c) => c.asset_code === asset.asset_code,
  );
  const lengthEnabled = selectedAssetCode?.has_length ?? false;
  const widthEnabled = selectedAssetCode?.has_width ?? false;
  const areaEnabled = selectedAssetCode?.has_area ?? false;
  const repairs = asset.recreation_asset_repair ?? [];

  const { register, getValues } = useForm<AssetEditFormValues>({
    defaultValues: {
      asset_name: asset.asset_name ?? '',
      asset_length:
        asset.asset_length != null ? String(asset.asset_length) : '',
      asset_width: asset.asset_width != null ? String(asset.asset_width) : '',
      asset_area: asset.asset_area != null ? String(asset.asset_area) : '',
      longitude: asset.longitude != null ? String(asset.longitude) : '',
      latitude: asset.latitude != null ? String(asset.latitude) : '',
      default_value:
        asset.default_value != null ? String(asset.default_value) : '',
      actual_value:
        asset.actual_value != null ? String(asset.actual_value) : '',
    },
  });

  function handleChange() {
    onChange(asset.asset_id, getValues());
  }

  const id = asset.asset_id;

  return (
    <Card className={`asset-card ${className}`}>
      <Card.Body>
        <div className="asset-card__header asset-card-edit__body">
          <h3 className="asset-card-edit__title">{asset.asset_name}</h3>

          <Form.Group
            controlId={`asset-name-${id}`}
            className="asset-card-edit__name-group"
          >
            <Form.Label>Asset name</Form.Label>
            <Form.Control
              type="text"
              {...register('asset_name')}
              onChange={(e) => {
                void register('asset_name').onChange(e);
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
                {...register('longitude')}
                onChange={(e) => {
                  void register('longitude').onChange(e);
                  handleChange();
                }}
              />
            </Form.Group>

            <Form.Group controlId={`asset-latitude-${id}`}>
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="number"
                step="any"
                {...register('latitude')}
                onChange={(e) => {
                  void register('latitude').onChange(e);
                  handleChange();
                }}
              />
            </Form.Group>

            {!isCampsite && (
              <Form.Group controlId={`asset-default-value-${id}`}>
                <Form.Label>Default Value</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="–"
                    {...register('default_value')}
                    onChange={(e) => {
                      void register('default_value').onChange(e);
                      handleChange();
                    }}
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
                    step="0.01"
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

          <AssetCardRepairsEdit
            repairs={repairs}
            repairCodes={repairCodes}
            recResourceId={recResourceId}
            assetId={asset.asset_id}
          />
        </div>
      </Card.Body>
    </Card>
  );
}

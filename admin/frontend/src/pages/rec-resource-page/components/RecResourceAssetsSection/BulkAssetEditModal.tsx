import { Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { CustomButton } from '@/components';
import './BulkAssetEditModal.scss';
import { AssetTypeGroup } from './assetTypeGrouping';
import { Checkbox } from '@bcgov/design-system-react-components';
import { useState } from 'react';
import { CampsiteGroup } from './campsiteGrouping';
import { useBulkUpdateAssets } from '@/services/hooks/recreation-resource-admin';
import { AssetCode } from './types';

interface BulkAssetEditModalProps {
  show: boolean;
  rec_resource_id: string;
  assetTypes: AssetTypeGroup[];
  campsites: CampsiteGroup[];
  assetCodes: AssetCode[];
  onCancel: () => void;
}

export function BulkAssetEditModal({
  show,
  rec_resource_id,
  assetTypes,
  campsites,
  assetCodes,
  onCancel,
}: BulkAssetEditModalProps) {
  const { mutate } = useBulkUpdateAssets();
  const [step, setStep] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [assetTypeGroup, setAssetTypeGroup] = useState<AssetTypeGroup | null>();

  // Selected assets from step 1
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

  // Form values to update
  const [editFields, setEditFields] = useState({
    length: '',
    width: '',
    area: '',
    actualValue: '',
    campsiteId: '',
  });

  const [enabledFields, setEnabledFields] = useState({
    hasWidth: false,
    hasLength: false,
    hasArea: false,
  });

  const getEndNumberOrString = (text: string | null) => {
    const match = text && text.match(/\d+$/);
    return match ? match[0] : text;
  };

  const showCampsideNumber = (id: number) => {
    const campsite = campsites.find((c) => c.campsite.asset_id === id);
    if (campsite?.campsite.asset_name) {
      return getEndNumberOrString(campsite?.campsite.asset_name);
    }
    return;
  };

  const handleCheckboxChange = (assetId: number) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleFieldChange = (field: keyof typeof editFields, value: string) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const selectAssetGroup = (value: string) => {
    setSelectedGroup(value);
    if (value === '') {
      setAssetTypeGroup(null);
      return;
    }
    setAssetTypeGroup(
      assetTypes.find((group) => group.structureCode === Number(value)),
    );
    const selectedStructureCode = assetCodes.find(
      (s) => s.asset_code === Number(value),
    );
    if (selectedStructureCode) {
      setEnabledFields({
        hasWidth: selectedStructureCode.has_width
          ? selectedStructureCode.has_width
          : false,
        hasLength: selectedStructureCode.has_length
          ? selectedStructureCode.has_length
          : false,
        hasArea: selectedStructureCode.has_area
          ? selectedStructureCode.has_area
          : false,
      });
    }
  };

  const clearFields = () => {
    setEditFields({
      length: '',
      width: '',
      area: '',
      actualValue: '',
      campsiteId: '',
    });
    setSelectedGroup('');
  };

  const handleContinue = () => {
    if (assetTypeGroup) {
      if (step === 2) {
        let update_fields = {};
        if (editFields.length !== '') {
          update_fields = {
            ...update_fields,
            asset_length: Number(editFields.length),
          };
        }
        if (editFields.width !== '') {
          update_fields = {
            ...update_fields,
            asset_width: Number(editFields.width),
          };
        }
        if (editFields.area !== '') {
          update_fields = {
            ...update_fields,
            asset_area: Number(editFields.area),
          };
        }
        if (editFields.actualValue !== '') {
          update_fields = {
            ...update_fields,
            actual_value: Number(editFields.actualValue),
          };
        }
        if (editFields.campsiteId !== '') {
          update_fields = {
            ...update_fields,
            parent_id: Number(editFields.campsiteId),
          };
        }
        const bulkUpdateObj = {
          rec_resource_id,
          asset_ids: selectedAssetIds,
          update_fields,
        };
        mutate({
          recreationAssetBulkUpdateDto: bulkUpdateObj,
        });
        setStep(0);
        setSelectedAssetIds([]);
        clearFields();
        onCancel();
        return;
      }
      setStep(step + 1);
    }
  };
  const handleBackCancel = () => {
    clearFields();
    if (step === 0) {
      onCancel();
    } else {
      setStep(step - 1);
    }
  };

  const checkChanges = (actualValue: number | null, newValue: string) => {
    const actualValueStr = actualValue ? actualValue.toString() : '';
    return actualValueStr !== newValue && newValue !== '';
  };

  const checkDisableButton = () => {
    if (!assetTypeGroup) return true;
    let isAnyValueChanged = false;
    for (const asset of assetTypeGroup.assets) {
      isAnyValueChanged = checkChanges(asset.asset_length, editFields.length);
      if (isAnyValueChanged) break;
      isAnyValueChanged = checkChanges(asset.asset_width, editFields.width);
      if (isAnyValueChanged) break;
      isAnyValueChanged = checkChanges(asset.asset_area, editFields.area);
      if (isAnyValueChanged) break;
      isAnyValueChanged = checkChanges(
        asset.actual_value,
        editFields.actualValue,
      );
      if (isAnyValueChanged) break;
      isAnyValueChanged = checkChanges(asset.parent_id, editFields.campsiteId);
      if (isAnyValueChanged) break;
    }
    if (step === 1 && (selectedAssetIds.length === 0 || !isAnyValueChanged)) {
      return true;
    }
    return false;
  };

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === assetTypeGroup?.assets.length) {
      setSelectedAssetIds([]);
    } else {
      const allIds = assetTypeGroup?.assets.map((asset) => asset.asset_id);
      if (allIds) setSelectedAssetIds(allIds);
    }
  };

  const clearAndCancel = () => {
    setStep(0);
    setSelectedAssetIds([]);
    clearFields();
    onCancel();
  };

  const step0 = (
    <>
      <h3 className="bulk-asset-edit-modal__subtitle">Select asset type</h3>

      <Row className="gy-3 mt-1">
        <Col xs={12} md={6}>
          <Form.Group controlId="bulk-edit-type">
            <Form.Label>Asset type</Form.Label>
            <Form.Select
              value={selectedGroup}
              onChange={(e) => selectAssetGroup(e.target.value)}
            >
              <option value="">Select asset type...</option>
              {assetTypes.map((type) => (
                <option key={type.structureCode} value={type.structureCode}>
                  {type.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const step1 = (
    <>
      <div className="bulk-asset-edit-modal__panel px-4 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="bulk-asset-edit-modal__subtitle panel-title mb-0">
            Select Assets ({selectedAssetIds.length} of{' '}
            {assetTypeGroup?.assets.length})
          </h3>
          <button
            className="btn btn-link p-0 text-decoration-underline fs-6 fw-normal"
            onClick={toggleSelectAll}
          >
            {selectedAssetIds.length === assetTypeGroup?.assets.length
              ? 'Clear All'
              : 'Select All'}
          </button>
        </div>
        <div className="row g-2 py-2">
          {assetTypeGroup &&
            assetTypeGroup.assets.map((asset) => {
              return (
                <div className="col-6" key={asset.asset_id}>
                  <div className="d-flex align-items-start gap-2">
                    <Checkbox
                      isSelected={selectedAssetIds.includes(asset.asset_id)}
                      onChange={() => handleCheckboxChange(asset.asset_id)}
                      data-testid={`asset-checkbox${asset.asset_id}`}
                    >
                      {/* lh-1 removes default line-height spacing above the text */}
                      <div className="d-flex flex-column lh-1 asset-name">
                        <span className="bold-field">
                          {asset.asset_comment
                            ? asset.asset_comment
                            : 'No description'}
                        </span>
                        <span className="mt-1">
                          {asset.asset_name ? asset.asset_name : 'No name'}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="bulk-asset-edit-modal__edit-fields mt-4">
        <h3 className="bulk-asset-edit-modal__subtitle">Fields to update</h3>
        <p>Choose one or more fields to apply to the assets above</p>
        <Row className="g-3 align-items-end">
          {/* Length */}
          <Col>
            <Form.Group
              controlId="field-length"
              className="d-flex flex-column h-100"
            >
              <Form.Label>Length</Form.Label>
              <InputGroup className="custom-input-group mt-auto">
                <Form.Control
                  type="number"
                  placeholder={enabledFields.hasLength ? '0' : '-'}
                  value={editFields.length}
                  disabled={!enabledFields.hasLength}
                  onChange={(e) => handleFieldChange('length', e.target.value)}
                />
                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Width */}
          <Col>
            <Form.Group
              controlId="field-width"
              className="d-flex flex-column h-100"
            >
              <Form.Label>Width</Form.Label>
              <InputGroup className="custom-input-group mt-auto">
                <Form.Control
                  type="number"
                  placeholder={enabledFields.hasWidth ? '0' : '-'}
                  value={editFields.width}
                  disabled={!enabledFields.hasWidth}
                  onChange={(e) => handleFieldChange('width', e.target.value)}
                />
                <InputGroup.Text>m</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Area */}
          <Col>
            <Form.Group
              controlId="field-area"
              className="d-flex flex-column h-100"
            >
              <Form.Label>Area</Form.Label>
              <InputGroup className="custom-input-group mt-auto">
                <Form.Control
                  type="number"
                  placeholder={enabledFields.hasArea ? '0' : '-'}
                  value={editFields.area}
                  disabled={!enabledFields.hasArea}
                  onChange={(e) => handleFieldChange('area', e.target.value)}
                />
                <InputGroup.Text>m²</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Actual Value */}
          <Col>
            <Form.Group
              controlId="field-value"
              className="d-flex flex-column h-100"
            >
              <Form.Label>Actual Value</Form.Label>
              <InputGroup className="custom-input-group mt-auto">
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={editFields.actualValue}
                  onChange={(e) =>
                    handleFieldChange('actualValue', e.target.value)
                  }
                />
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Assign to Campsite */}
          <Col>
            <Form.Group
              controlId="field-campsite"
              className="d-flex flex-column h-100"
            >
              <Form.Label>Assign to campsite</Form.Label>
              <Form.Select
                className="mt-auto"
                value={editFields.campsiteId}
                onChange={(e) =>
                  handleFieldChange('campsiteId', e.target.value)
                }
              >
                <option value="">Select campsite...</option>
                {campsites.map((c) => {
                  return (
                    <option
                      value={c.campsite.asset_id}
                      key={c.campsite.asset_id}
                    >
                      {getEndNumberOrString(c.campsite.asset_name)}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>
    </>
  );

  const step2 = (
    <div className="bulk-asset-edit-modal__panel px-4 py-3">
      <h3 className="bulk-asset-edit-modal__subtitle panel-title mb-0">
        Review your changes
      </h3>
      {assetTypeGroup &&
        assetTypeGroup.assets
          .filter((asset) => selectedAssetIds.includes(asset.asset_id))
          .map((asset, index) => {
            return (
              <div
                key={`review-${asset.asset_id}`}
                className={`py-4 ${
                  selectedAssetIds.length - 1 > index ? 'bottom-border' : ''
                }`}
              >
                <p className="asset-title">
                  {asset.asset_name} {asset.asset_comment}
                </p>
                <Row className="g-3 align-items-end review-info">
                  {/* Length */}
                  {checkChanges(asset.asset_length, editFields.length) && (
                    <Col>
                      <div className="d-flex flex-column h-100">
                        <div className="bold-field">Length (m)</div>
                        <div className="mt-auto">
                          {asset.asset_length ? asset.asset_length : 'N/A'} →{' '}
                          <span className="bold-field">
                            {editFields.length ? editFields.length : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}

                  {/* Width */}
                  {checkChanges(asset.asset_width, editFields.width) && (
                    <Col>
                      <div className="d-flex flex-column h-100">
                        <div className="bold-field">Width (m)</div>
                        <div className="mt-auto">
                          {asset.asset_width ? asset.asset_width : 'N/A'} →{' '}
                          <span className="bold-field">
                            {editFields.width ? editFields.width : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}

                  {/* Area */}
                  {checkChanges(asset.asset_area, editFields.area) && (
                    <Col>
                      <div className="d-flex flex-column h-100">
                        <div className="bold-field">Area (m²)</div>
                        <div className="mt-auto">
                          {asset.asset_area ? asset.asset_area : 'N/A'} →{' '}
                          <span className="bold-field">
                            {editFields.area ? editFields.area : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}

                  {/* Actual Value */}
                  {checkChanges(asset.actual_value, editFields.actualValue) && (
                    <Col>
                      <div className="d-flex flex-column h-100">
                        <div className="bold-field">Actual Value</div>
                        <div className="mt-auto">
                          {asset.actual_value
                            ? `$${asset.actual_value}`
                            : 'N/A'}{' '}
                          →{' '}
                          <span className="bold-field">
                            {editFields.actualValue
                              ? `$${editFields.actualValue}`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}

                  {/* Assign to Campsite */}
                  {checkChanges(asset.parent_id, editFields.campsiteId) && (
                    <Col>
                      <div className="d-flex flex-column h-100">
                        <div className="bold-field">Assign to Campsite</div>
                        <div className="mt-auto">
                          {asset.parent_id ? asset.parent_id : 'N/A'} →{' '}
                          <span className="bold-field">
                            {editFields.campsiteId
                              ? showCampsideNumber(
                                  Number(editFields.campsiteId),
                                )
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            );
          })}
    </div>
  );

  return (
    <Modal
      show={show}
      onHide={clearAndCancel}
      centered
      className="bulk-asset-edit-modal"
      size="lg"
    >
      <Modal.Header closeButton className="bulk-asset-edit-modal__header">
        <Modal.Title className="bulk-asset-edit-modal__title">
          Bulk update
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bulk-asset-edit-modal__body">
        {step === 0 && step0}
        {step > 0 && (
          <h3 className="bulk-asset-edit-modal__subtitle">
            Update {assetTypeGroup?.description}
          </h3>
        )}
        {step === 1 && step1}
        {step === 2 && step2}
      </Modal.Body>
      <Modal.Footer className="bulk-asset-edit-modal__header__footer">
        <CustomButton variant="outline-primary" onClick={handleBackCancel}>
          {step === 0 ? 'Cancel' : 'Back'}
        </CustomButton>
        <CustomButton
          variant="primary"
          onClick={handleContinue}
          disabled={checkDisableButton()}
        >
          {step === 0 && 'Continue'}
          {step === 1 && 'Review'}
          {step === 2 &&
            `Update ${selectedAssetIds.length} asset${selectedAssetIds.length > 1 ? 's' : ''}`}
        </CustomButton>
      </Modal.Footer>
    </Modal>
  );
}

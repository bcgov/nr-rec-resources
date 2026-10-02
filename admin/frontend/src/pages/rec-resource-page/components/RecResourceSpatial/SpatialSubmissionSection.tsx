import { useEffect, useMemo, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleExclamation,
  faCircleInfo,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { useCreateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceMapFeatures';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import {
  DEFAULT_SECTION_ID_FIELD_NAME,
  extractSectionIdDetails,
  prepareFeatureCollectionForSectionEditing,
  readSpatialFile,
  updateFeatureSectionId,
  validateGeometry,
  type FeatureSectionId,
  type SubmissionMetadata,
  type ValidationIssue,
} from './spatialSubmissionUtils';
import { SpatialSubmissionMap } from './SpatialSubmissionMap';
import './SpatialSubmissionSection.scss';
import '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection.scss';

interface SpatialSubmissionSectionProps {
  recResourceId: string;
  defaultRecreationTypeCode?: string;
  defaultNaturalResourceDistrict?: string;
  defaultRecreationDistrict?: string;
}

const FEATURE_TYPE_OPTIONS = [
  { value: 'LineString', label: 'Linear' },
  { value: 'Polygon', label: 'Polygon' },
];

interface WizardValues {
  recreationName: string;
  recreationType: string;
  featureType: string;
  targetCrs: string;
  metadata: SubmissionMetadata;
}

type RequiredFieldKey =
  | 'recreationType'
  | 'featureType'
  | 'email'
  | 'telephone'
  | 'contactName'
  | 'districtCode'
  | 'recreationDistrict';

const defaultValues: WizardValues = {
  recreationName: '',
  recreationType: '',
  featureType: '',
  targetCrs: 'EPSG:3005',
  metadata: {
    email: '',
    telephone: '',
    contactName: '',
    districtCode: '',
    recreationDistrict: '',
    licenseRecNumber: '',
    rootNamespace: 'esf',
    businessNamespace: 'ftc',
    actionCode: 'I',
    accuracyCode: '10',
    captureMethod: 'GPS',
    dataSource: 'Unknown',
  },
};

const REQUIRED_FIELD_LABELS: Record<RequiredFieldKey, string> = {
  recreationType: 'Recreation type',
  featureType: 'Feature type',
  email: 'Email Address',
  telephone: 'Telephone Number',
  contactName: 'Submitter Name',
  districtCode: 'Natural Resource District',
  recreationDistrict: 'Recreation District',
};

const getMissingRequiredFields = (values: WizardValues): RequiredFieldKey[] => {
  const missing: RequiredFieldKey[] = [];

  if (!values.recreationType.trim()) {
    missing.push('recreationType');
  }
  if (!values.featureType.trim()) {
    missing.push('featureType');
  }
  if (!values.metadata.email.trim()) {
    missing.push('email');
  }
  if (!values.metadata.telephone.trim()) {
    missing.push('telephone');
  }
  if (!values.metadata.contactName.trim()) {
    missing.push('contactName');
  }
  if (!values.metadata.districtCode.trim()) {
    missing.push('districtCode');
  }
  if (!values.metadata.recreationDistrict.trim()) {
    missing.push('recreationDistrict');
  }

  return missing;
};

export const SpatialSubmissionSection = ({
  recResourceId,
  defaultRecreationTypeCode = '',
  defaultNaturalResourceDistrict = '',
  defaultRecreationDistrict = '',
}: SpatialSubmissionSectionProps) => {
  const { user, authService } = useAuthContext();
  const {
    data: districtOptionGroups,
    isLoading: areDistrictOptionsLoading,
    isError: areDistrictOptionsErrored,
  } = useGetRecreationResourceOptions([
    GetOptionsByTypesTypesEnum.NaturalDistrict,
    GetOptionsByTypesTypesEnum.District,
    GetOptionsByTypesTypesEnum.ResourceType,
  ]);
  const [values, setValues] = useState<WizardValues>(defaultValues);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createStatus, setCreateStatus] = useState<{
    variant: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [editableFeatureCollection, setEditableFeatureCollection] = useState<
    any | null
  >(null);
  const [featureSectionIds, setFeatureSectionIds] = useState<
    FeatureSectionId[]
  >([]);
  const [sectionIdFieldName, setSectionIdFieldName] = useState<string | null>(
    null,
  );
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<
    number | null
  >(null);
  const { mutateAsync: createMapFeatures, isPending: isCreatingRequest } =
    useCreateRecreationResourceMapFeatures();
  const requestCreated = createStatus?.variant === 'success';
  const [hasValidateAttempted, setHasValidateAttempted] = useState(false);
  const [showValidationSuccessNotice, setShowValidationSuccessNotice] =
    useState(true);
  const [showDistrictOptionsNotice, setShowDistrictOptionsNotice] =
    useState(true);

  const optionGroupsByType = useMemo(() => {
    return new Map(
      (districtOptionGroups ?? []).map((group) => [group.type, group]),
    );
  }, [districtOptionGroups]);

  const naturalDistrictOptionsResponse = optionGroupsByType.get(
    GetOptionsByTypesTypesEnum.NaturalDistrict,
  );
  const recreationDistrictOptionsResponse = optionGroupsByType.get(
    GetOptionsByTypesTypesEnum.District,
  );
  const resourceTypeOptionsResponse = optionGroupsByType.get(
    GetOptionsByTypesTypesEnum.ResourceType,
  );

  const naturalResourceDistrictOptions = useMemo(
    () =>
      (naturalDistrictOptionsResponse?.options ?? []).filter((option) =>
        Boolean(option.label?.trim()),
      ),
    [naturalDistrictOptionsResponse],
  );

  const recreationDistrictOptions = useMemo(
    () =>
      (recreationDistrictOptionsResponse?.options ?? []).filter(
        (option) => !option.is_archived && Boolean(option.label?.trim()),
      ),
    [recreationDistrictOptionsResponse],
  );

  const recreationTypeOptions = useMemo(
    () =>
      (resourceTypeOptionsResponse?.options ?? []).filter((option) =>
        Boolean(option.label?.trim()),
      ),
    [resourceTypeOptionsResponse],
  );
  const missingRequiredFields = useMemo(
    () => getMissingRequiredFields(values),
    [values],
  );
  const shouldShowRequiredValidation =
    hasValidateAttempted && missingRequiredFields.length > 0;
  const hasMissingField = (field: RequiredFieldKey) =>
    shouldShowRequiredValidation && missingRequiredFields.includes(field);

  const setMetadata = (name: keyof SubmissionMetadata, value: string) => {
    setValues((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [name]: value },
    }));
  };

  useEffect(() => {
    const autoFilledEmail = user?.email?.trim() ?? '';
    const autoFilledContactName = authService.getUserFullName().trim();

    setValues((prev) => ({
      ...prev,
      recreationType: prev.recreationType || defaultRecreationTypeCode,
      metadata: {
        ...prev.metadata,
        districtCode:
          prev.metadata.districtCode || defaultNaturalResourceDistrict,
        recreationDistrict:
          prev.metadata.recreationDistrict || defaultRecreationDistrict,
        email: prev.metadata.email || autoFilledEmail,
        contactName: prev.metadata.contactName || autoFilledContactName,
        licenseRecNumber: prev.metadata.licenseRecNumber || recResourceId,
      },
    }));
  }, [
    authService,
    recResourceId,
    defaultNaturalResourceDistrict,
    defaultRecreationDistrict,
    defaultRecreationTypeCode,
    user?.email,
  ]);

  const handleSpatialFilesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setSelectedFiles(nextFiles);
    setEditableFeatureCollection(null);
    setFeatureSectionIds([]);
    setSectionIdFieldName(null);
    setSelectedFeatureIndex(null);
    setIssues([]);
    setCreateStatus(null);
  };

  const validateFeatureCollection = (featureCollection: any) => {
    const sectionIdDetails = extractSectionIdDetails(featureCollection);
    const nextIssues: ValidationIssue[] = [
      ...sectionIdDetails.issues,
      ...validateGeometry(featureCollection, {
        expectedSrsName: 'EPSG:3005',
        enforceExpectedSrsName: true,
        expectedGeometryType: values.featureType as
          | 'Point'
          | 'LineString'
          | 'Polygon',
      }),
    ];

    setEditableFeatureCollection(featureCollection);
    setFeatureSectionIds(sectionIdDetails.featureSectionIds);
    setSectionIdFieldName(sectionIdDetails.fieldName);
    setSelectedFeatureIndex((current) => {
      if (!sectionIdDetails.featureSectionIds.length) {
        return null;
      }

      if (
        current === null ||
        current >= sectionIdDetails.featureSectionIds.length
      ) {
        return 0;
      }

      return current;
    });
    setIssues(nextIssues);

    return nextIssues;
  };

  const handleValidateSpatialFile = async () => {
    setHasValidateAttempted(true);
    setIsProcessing(true);
    setCreateStatus(null);

    if (!selectedFiles.length) {
      setEditableFeatureCollection(null);
      setFeatureSectionIds([]);
      setSectionIdFieldName(null);
      setSelectedFeatureIndex(null);
      setIssues([
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message:
            'Please upload a .zip shapefile bundle or a .shp file (with matching .dbf when available).',
        },
      ]);
      setIsProcessing(false);
      return;
    }

    try {
      const featureCollection = editableFeatureCollection
        ? editableFeatureCollection
        : prepareFeatureCollectionForSectionEditing(
            await (
              readSpatialFile as (
                input: File | File[] | FileList,
              ) => Promise<any>
            )(selectedFiles),
          ).featureCollection;

      const nextIssues = validateFeatureCollection(featureCollection);

      const hasBlockingErrors = nextIssues.some(
        (issue) => issue.severity === 'ERROR',
      );

      if (hasBlockingErrors) {
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      setEditableFeatureCollection(null);
      setFeatureSectionIds([]);
      setSectionIdFieldName(null);
      setSelectedFeatureIndex(null);
      setIssues([
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message:
            error instanceof Error
              ? `Unable to parse shapefile: ${error.message}`
              : 'Unable to parse shapefile.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSectionIdChange = (nextSectionId: string) => {
    if (
      editableFeatureCollection === null ||
      selectedFeatureIndex === null ||
      selectedFeatureIndex < 0
    ) {
      return;
    }

    const nextFeatureCollection = updateFeatureSectionId(
      editableFeatureCollection,
      selectedFeatureIndex,
      sectionIdFieldName ?? DEFAULT_SECTION_ID_FIELD_NAME,
      nextSectionId,
    );

    setCreateStatus(null);
    validateFeatureCollection(nextFeatureCollection);
  };

  const handleCreateRequest = async () => {
    setHasValidateAttempted(true);
    if (missingRequiredFields.length) {
      setCreateStatus({
        variant: 'danger',
        message: `Please complete required fields: ${missingRequiredFields
          .map((field) => REQUIRED_FIELD_LABELS[field])
          .join(', ')}.`,
      });
      return;
    }

    if (!editableFeatureCollection?.features?.length) {
      setCreateStatus({
        variant: 'danger',
        message: 'Please validate a shapefile before creating the request.',
      });
      return;
    }

    try {
      setCreateStatus(null);

      await createMapFeatures({
        recResourceId,
        ...(values.recreationName.trim()
          ? { recResourceName: values.recreationName.trim() }
          : {}),
        features: editableFeatureCollection.features.map(
          (feature: any, index: number) => ({
            geometry: feature.geometry,
            sectionId: featureSectionIds[index]?.sectionId?.trim() || undefined,
          }),
        ),
        recreationTypeCode: values.recreationType || undefined,
        naturalResourceDistrictCode: values.metadata.districtCode || undefined,
        recreationDistrictCode: values.metadata.recreationDistrict || undefined,
        submittedBy:
          values.metadata.contactName || values.metadata.email || undefined,
      });

      setCreateStatus({
        variant: 'success',
        message: 'Map feature request created successfully.',
      });
    } catch (error) {
      setCreateStatus({
        variant: 'danger',
        message:
          error instanceof Error
            ? `Unable to create request: ${error.message}`
            : 'Unable to create request.',
      });
    }
  };

  const canCreateRequest =
    Boolean(editableFeatureCollection?.features?.length) &&
    Boolean(values.recreationType.trim()) &&
    Boolean(values.featureType.trim()) &&
    Boolean(values.metadata.email.trim()) &&
    Boolean(values.metadata.telephone.trim()) &&
    Boolean(values.metadata.contactName.trim()) &&
    Boolean(values.metadata.districtCode.trim()) &&
    Boolean(values.metadata.recreationDistrict.trim()) &&
    !issues.some((issue) => issue.severity === 'ERROR');

  const selectedSectionFeature =
    selectedFeatureIndex === null
      ? null
      : (featureSectionIds[selectedFeatureIndex] ?? null);
  const hasValidationErrors = issues.some(
    (issue) => issue.severity === 'ERROR',
  );
  const hasValidationSuccessNotice =
    Boolean(editableFeatureCollection?.features?.length) && issues.length === 0;

  useEffect(() => {
    if (hasValidationSuccessNotice) {
      setShowValidationSuccessNotice(true);
    }
  }, [hasValidationSuccessNotice]);

  useEffect(() => {
    if (areDistrictOptionsErrored) {
      setShowDistrictOptionsNotice(true);
    }
  }, [areDistrictOptionsErrored]);

  return (
    <Card>
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Spatial submission</h2>
      </div>

      <div className="exhibit-a-section__grid">
        {(hasValidationSuccessNotice ||
          Boolean(createStatus) ||
          (areDistrictOptionsErrored && showDistrictOptionsNotice)) && (
          <div className="spatial-submission-section__fixed-notifications">
            {hasValidationSuccessNotice && showValidationSuccessNotice && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setShowValidationSuccessNotice(false)}
                className="mb-2"
              >
                Spatial file validated successfully.
              </Alert>
            )}

            {createStatus && (
              <Alert
                variant={createStatus.variant}
                dismissible
                onClose={() => setCreateStatus(null)}
                className="mb-2"
              >
                {createStatus.message}
              </Alert>
            )}

            {areDistrictOptionsErrored && showDistrictOptionsNotice ? (
              <Alert
                variant="warning"
                dismissible
                onClose={() => setShowDistrictOptionsNotice(false)}
                className="mb-0"
              >
                Unable to load district/type options. Please refresh and try
                again.
              </Alert>
            ) : null}
          </div>
        )}

        <Row className="gy-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation Name (optional)</Form.Label>
              <Form.Control
                aria-label="Recreation Name"
                value={values.recreationName}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    recreationName: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation type</Form.Label>
              <Form.Select
                aria-label="Recreation type"
                required
                isInvalid={hasMissingField('recreationType')}
                value={values.recreationType}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    recreationType: e.target.value,
                  }))
                }
              >
                <option value="">
                  {recreationTypeOptions.length
                    ? 'Select Recreation type'
                    : 'Loading recreation types...'}
                </option>
                {recreationTypeOptions.map((typeOption) => (
                  <option key={typeOption.id} value={typeOption.id}>
                    {typeOption.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Feature type</Form.Label>
              <Form.Select
                aria-label="Feature type"
                required
                isInvalid={hasMissingField('featureType')}
                value={values.featureType}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    featureType: e.target.value,
                  }))
                }
              >
                <option value="">Select feature type</option>
                {FEATURE_TYPE_OPTIONS.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                aria-label="Email Address"
                type="email"
                required
                isInvalid={hasMissingField('email')}
                value={values.metadata.email}
                onChange={(e) => setMetadata('email', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Telephone Number</Form.Label>
              <Form.Control
                aria-label="Telephone Number"
                required
                isInvalid={hasMissingField('telephone')}
                value={values.metadata.telephone}
                onChange={(e) => setMetadata('telephone', e.target.value)}
                placeholder="10 digits (e.g. 6045550100)"
              />
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Submitter Name</Form.Label>
              <Form.Control
                aria-label="Submitter Name"
                required
                isInvalid={hasMissingField('contactName')}
                value={values.metadata.contactName}
                onChange={(e) => setMetadata('contactName', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Natural Resource District</Form.Label>
              <Form.Select
                aria-label="Natural Resource District"
                disabled={areDistrictOptionsLoading}
                required
                isInvalid={hasMissingField('districtCode')}
                value={values.metadata.districtCode}
                onChange={(e) => setMetadata('districtCode', e.target.value)}
              >
                <option value="">
                  {areDistrictOptionsLoading
                    ? 'Loading districts...'
                    : 'Select district'}
                </option>
                {naturalResourceDistrictOptions.map((district) => (
                  <option
                    key={district.id ?? district.label}
                    value={district.id}
                  >
                    {district.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation District</Form.Label>
              <Form.Select
                aria-label="Recreation District"
                disabled={areDistrictOptionsLoading}
                required
                isInvalid={hasMissingField('recreationDistrict')}
                value={values.metadata.recreationDistrict}
                onChange={(e) =>
                  setMetadata('recreationDistrict', e.target.value)
                }
              >
                <option value="">
                  {areDistrictOptionsLoading
                    ? 'Loading districts...'
                    : 'Select district'}
                </option>
                {recreationDistrictOptions.map((district) => (
                  <option
                    key={district.id ?? district.label}
                    value={district.id}
                  >
                    {district.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                This is required.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>REC#</Form.Label>
              <Form.Control
                aria-readonly={true}
                aria-label="REC#"
                disabled={true}
                readOnly
                value={values.metadata.licenseRecNumber}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Coordinate System</Form.Label>
              <Form.Control
                aria-readonly={true}
                aria-label="Coordinate System"
                value={values.targetCrs}
                readOnly
                disabled={true}
              ></Form.Control>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Upload Spatial File (.zip or .shp)</Form.Label>
              <Form.Control
                aria-label="Spatial File"
                type="file"
                accept=".zip,.shp,.dbf"
                multiple
                onChange={handleSpatialFilesChange}
                disabled={requestCreated}
              />
              <Form.Text muted>
                Upload one `.zip` bundle (`.shp/.shx/.dbf/.cpg`) or upload
                `.shp` with matching `.dbf` in one selection.
              </Form.Text>
            </Form.Group>
          </Col>
          <Col
            xs={12}
            className="spatial-submission-section__actions mb-5 mt-5"
          >
            <Button
              variant="primary"
              className="spatial-submission-section__validate-button"
              disabled={isProcessing || requestCreated}
              onClick={handleValidateSpatialFile}
            >
              {isProcessing ? (
                <>
                  <Spinner as="span" size="sm" className="me-2" />
                  Validating...
                </>
              ) : (
                'Validate Spatial File'
              )}
            </Button>
          </Col>

          <Col xs={12}>
            {issues.length > 0 && (
              <Alert
                className={`mt-3 mb-0 spatial-submission-section__validation-alert spatial-submission-section__validation-alert--${hasValidationErrors ? 'danger' : 'warning'}`}
                variant="light"
              >
                <FontAwesomeIcon
                  icon={faCircleExclamation as IconProp}
                  aria-hidden="true"
                  className="spatial-submission-section__validation-alert-icon"
                />
                <div className="spatial-submission-section__validation-alert-content">
                  <strong className="spatial-submission-section__validation-alert-title">
                    Validation Results
                  </strong>
                  <ul className="spatial-submission-section__validation-alert-list">
                    {issues.map((issue, idx) => (
                      <li key={`${issue.type}-${idx}`}>
                        [{issue.type}] {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </Alert>
            )}
          </Col>

          <Col xs={12}>
            {editableFeatureCollection?.features?.length && (
              <>
                <Form.Label>Spatial Preview</Form.Label>
                {featureSectionIds.length > 0 && (
                  <Alert
                    className="mt-3 mb-0 spatial-submission-section__info-alert"
                    variant="light"
                  >
                    <FontAwesomeIcon
                      icon={faCircleInfo as IconProp}
                      aria-hidden="true"
                      className="spatial-submission-section__info-alert-icon"
                    />
                    <span className="spatial-submission-section__info-alert-text">
                      Click a section in the list or on the map to rename it
                      before creating the request.
                    </span>
                  </Alert>
                )}
                <Col xs={12} className={'mt-3 mb-3'}>
                  {featureSectionIds.length > 0 && (
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      <Row className="g-3 align-items-end">
                        <Col xs={12} lg={5}>
                          <div className="fw-semibold mb-2">
                            Sections ({featureSectionIds.length})
                          </div>
                        </Col>
                        <Col xs={12} lg={7}>
                          {selectedSectionFeature && (
                            <div className="fw-semibold mb-2">Section ID</div>
                          )}
                        </Col>
                      </Row>
                      <Row className="g-3">
                        <Col xs={12} lg={5}>
                          <Card>
                            <div
                              className="list-group"
                              style={{ maxHeight: '280px', overflowY: 'auto' }}
                            >
                              {featureSectionIds.map(
                                (featureSectionId, index) => {
                                  const isSelected =
                                    selectedFeatureIndex === index;
                                  const sectionLabel =
                                    featureSectionId.sectionId?.trim() ||
                                    `Feature #${featureSectionId.featureIndex}`;

                                  return (
                                    <button
                                      key={`section-feature-${featureSectionId.featureIndex}`}
                                      type="button"
                                      className={`list-group-item list-group-item-action${
                                        isSelected ? ' active' : ''
                                      }`}
                                      onClick={() =>
                                        setSelectedFeatureIndex(index)
                                      }
                                    >
                                      <div className="fw-semibold">
                                        {sectionLabel}
                                      </div>
                                      <div
                                        className={
                                          isSelected
                                            ? 'text-white-50 small'
                                            : 'text-muted small'
                                        }
                                      >
                                        Feature #{featureSectionId.featureIndex}
                                      </div>
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </Card>
                        </Col>
                        <Col xs={12} lg={7}>
                          {selectedSectionFeature && (
                            <Form.Group>
                              <Form.Control
                                aria-label="Section ID / name"
                                value={selectedSectionFeature.sectionId ?? ''}
                                onChange={(event) =>
                                  handleSectionIdChange(event.target.value)
                                }
                                placeholder="Enter a unique section name"
                              />
                            </Form.Group>
                          )}
                        </Col>
                      </Row>
                    </div>
                  )}

                  {editableFeatureCollection?.features?.length > 0 &&
                    featureSectionIds.length === 0 && (
                      <Alert variant="warning" className="mb-0">
                        No section features were available to edit.
                      </Alert>
                    )}
                </Col>

                <SpatialSubmissionMap
                  features={editableFeatureCollection.features}
                  selectedFeatureIndex={selectedFeatureIndex}
                  onFeatureSelect={setSelectedFeatureIndex}
                />
                <Button
                  className="spatial-submission-section__create-button mt-5"
                  disabled={
                    !canCreateRequest || isCreatingRequest || requestCreated
                  }
                  onClick={handleCreateRequest}
                >
                  {isCreatingRequest ? (
                    <>
                      <Spinner as="span" size="sm" className="me-2" />
                      Creating request...
                    </>
                  ) : (
                    'Create Request'
                  )}
                </Button>
              </>
            )}
          </Col>
        </Row>
      </div>
    </Card>
  );
};

import { useEffect, useMemo, useState } from 'react';
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
import '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection.scss';

interface SpatialSubmissionSectionProps {
  recResourceId: string;
  defaultRecreationTypeCode?: string;
  defaultNaturalResourceDistrict?: string;
  defaultRecreationDistrict?: string;
}

const FEATURE_TYPE_OPTIONS = [
  { value: 'Point', label: 'Point' },
  { value: 'LineString', label: 'Linear' },
  { value: 'Polygon', label: 'Polygon' },
];

interface WizardValues {
  recreationType: string;
  featureType: string;
  targetCrs: string;
  metadata: SubmissionMetadata;
}

const defaultValues: WizardValues = {
  recreationType: '',
  featureType: 'Polygon',
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
    setIsProcessing(true);

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
    !issues.some((issue) => issue.severity === 'ERROR');

  const selectedSectionFeature =
    selectedFeatureIndex === null
      ? null
      : (featureSectionIds[selectedFeatureIndex] ?? null);

  return (
    <Card>
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Spatial submission</h2>
      </div>
      <div className="exhibit-a-section__grid">
        <Row className="gy-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation type</Form.Label>
              <Form.Select
                aria-label="Recreation type"
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
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Feature type</Form.Label>
              <Form.Select
                aria-label="Feature type"
                value={values.featureType}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    featureType: e.target.value,
                  }))
                }
              >
                {FEATURE_TYPE_OPTIONS.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                aria-label="Email Address"
                type="email"
                value={values.metadata.email}
                onChange={(e) => setMetadata('email', e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Telephone Number</Form.Label>
              <Form.Control
                aria-label="Telephone Number"
                value={values.metadata.telephone}
                onChange={(e) => setMetadata('telephone', e.target.value)}
                placeholder="10 digits (e.g. 6045550100)"
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Submitter Name</Form.Label>
              <Form.Control
                aria-label="Submitter Name"
                value={values.metadata.contactName}
                onChange={(e) => setMetadata('contactName', e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Natural Resource District</Form.Label>
              <Form.Select
                aria-label="Natural Resource District"
                disabled={areDistrictOptionsLoading}
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
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation District</Form.Label>
              <Form.Select
                aria-label="Recreation District"
                disabled={areDistrictOptionsLoading}
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

          <Col xs={12}>
            {featureSectionIds.length > 0 && (
              <Alert variant="info" className="mb-0">
                <strong>Sections ({featureSectionIds.length})</strong>
                <div className="small text-muted mt-1">
                  Editable field:{' '}
                  {sectionIdFieldName ?? DEFAULT_SECTION_ID_FIELD_NAME}
                </div>
                <Row className="g-3 mt-1">
                  <Col xs={12} lg={5}>
                    <div
                      className="list-group"
                      style={{ maxHeight: '280px', overflowY: 'auto' }}
                    >
                      {featureSectionIds.map((featureSectionId, index) => {
                        const isSelected = selectedFeatureIndex === index;
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
                            onClick={() => setSelectedFeatureIndex(index)}
                          >
                            <div className="fw-semibold">{sectionLabel}</div>
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
                      })}
                    </div>
                  </Col>
                  <Col xs={12} lg={7}>
                    {selectedSectionFeature && (
                      <Form.Group>
                        <Form.Label>
                          Section ID / name for feature #
                          {selectedSectionFeature.featureIndex}
                        </Form.Label>
                        <Form.Control
                          aria-label="Section ID / name"
                          value={selectedSectionFeature.sectionId ?? ''}
                          onChange={(event) =>
                            handleSectionIdChange(event.target.value)
                          }
                          placeholder="Enter a unique section name"
                        />
                        <Form.Text muted>
                          Click a section in the list or on the map to rename it
                          before creating the request.
                        </Form.Text>
                      </Form.Group>
                    )}
                  </Col>
                </Row>
              </Alert>
            )}

            {editableFeatureCollection?.features?.length > 0 &&
              featureSectionIds.length === 0 && (
                <Alert variant="warning" className="mb-0">
                  No section features were available to edit.
                </Alert>
              )}
          </Col>

          <Col xs={12}>
            {editableFeatureCollection?.features?.length && (
              <>
                <Form.Label>Spatial Preview</Form.Label>
                <SpatialSubmissionMap
                  features={editableFeatureCollection.features}
                  selectedFeatureIndex={selectedFeatureIndex}
                  onFeatureSelect={setSelectedFeatureIndex}
                />
              </>
            )}
          </Col>

          <Col xs={12} className="d-flex gap-2">
            <Button
              variant="primary"
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
            <Button
              variant="success"
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
          </Col>
        </Row>

        {issues.length > 0 && (
          <Alert
            className="mt-3 mb-0"
            variant={
              issues.some((x) => x.severity === 'ERROR') ? 'danger' : 'warning'
            }
          >
            <strong>Validation Results</strong>
            <ul className="mb-0 mt-2">
              {issues.map((issue, idx) => (
                <li key={`${issue.type}-${idx}`}>
                  [{issue.type}] {issue.message}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {editableFeatureCollection?.features?.length > 0 &&
          issues.length === 0 && (
            <Alert variant="success" className="mt-3 mb-0">
              Spatial file validated successfully.
            </Alert>
          )}

        {createStatus && (
          <Alert className="mt-3 mb-0" variant={createStatus.variant}>
            {createStatus.message}
          </Alert>
        )}

        {areDistrictOptionsErrored ? (
          <Alert className="mt-3 mb-0" variant="warning">
            Unable to load district/type options. Please refresh and try again.
          </Alert>
        ) : null}
      </div>
    </Card>
  );
};

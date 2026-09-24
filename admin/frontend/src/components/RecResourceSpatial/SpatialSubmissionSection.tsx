import { useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
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
import type { SpatialFeatureCollection } from './spatialSubmission.types';
import {
  DEFAULT_WIZARD_VALUES,
  REQUIRED_FIELD_LABELS,
} from './SpatialSubmissionSection.constants';
import {
  getMissingRequiredFields,
  requiresSectionIdsForFeatureCollection,
} from './SpatialSubmissionSection.helpers';
import { SpatialSubmissionFormFields } from './SpatialSubmissionFormFields';
import { SpatialSubmissionAlerts } from './SpatialSubmissionNotifications';
import { SpatialSubmissionPreview } from './SpatialSubmissionPreview';
import type {
  CreateStatus,
  RequiredFieldKey,
  SpatialSubmissionSectionProps,
  WizardValues,
} from './SpatialSubmissionSection.types';
import './SpatialSubmissionSection.scss';
import '@/pages/rec-resource-page/components/RecResourceGeospatialSection/ExhibitASection/ExhibitASection.scss';

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
  const [values, setValues] = useState<WizardValues>(() => ({
    ...DEFAULT_WIZARD_VALUES,
    recreationType: defaultRecreationTypeCode,
    metadata: {
      ...DEFAULT_WIZARD_VALUES.metadata,
      districtCode: defaultNaturalResourceDistrict,
      recreationDistrict: defaultRecreationDistrict,
      email: user?.email?.trim() ?? '',
      contactName: authService.getUserFullName().trim(),
      licenseRecNumber: recResourceId,
    },
  }));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createStatus, setCreateStatus] = useState<CreateStatus | null>(null);
  const [editableFeatureCollection, setEditableFeatureCollection] =
    useState<SpatialFeatureCollection | null>(null);
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

  const requiresSectionIds = editableFeatureCollection
    ? requiresSectionIdsForFeatureCollection(editableFeatureCollection)
    : false;

  const resetSpatialPreviewState = () => {
    setEditableFeatureCollection(null);
    setFeatureSectionIds([]);
    setSectionIdFieldName(null);
    setSelectedFeatureIndex(null);
  };

  const setMetadata = (name: keyof SubmissionMetadata, value: string) => {
    setValues((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [name]: value },
    }));
  };

  const handleSpatialFilesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setSelectedFiles(nextFiles);
    resetSpatialPreviewState();
    setIssues([]);
    setCreateStatus(null);
  };

  const validateFeatureCollection = (featureCollection: any) => {
    const requiresSectionIdsForUpload =
      requiresSectionIdsForFeatureCollection(featureCollection);
    const sectionIdDetails = requiresSectionIdsForUpload
      ? extractSectionIdDetails(featureCollection)
      : {
          fieldName: null,
          featureSectionIds: [],
          issues: [],
        };
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
      resetSpatialPreviewState();
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
      const featureCollection =
        editableFeatureCollection ??
        prepareFeatureCollectionForSectionEditing(
          await (
            readSpatialFile as (input: File | File[] | FileList) => Promise<any>
          )(selectedFiles),
        ).featureCollection;

      const nextIssues = validateFeatureCollection(featureCollection);

      const hasBlockingErrors = nextIssues.some(
        (issue) => issue.severity === 'ERROR',
      );

      if (hasBlockingErrors) {
        return;
      }

      setShowValidationSuccessNotice(true);
    } catch (error) {
      resetSpatialPreviewState();
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
      sectionIdFieldName || DEFAULT_SECTION_ID_FIELD_NAME,
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
      const recResourceName = values.recreationName.trim();
      const submittedBy = values.metadata.contactName || values.metadata.email;

      await createMapFeatures({
        recResourceId,
        recResourceName: recResourceName || undefined,
        features: editableFeatureCollection.features.map(
          (feature: any, index: number) => ({
            geometry: feature.geometry,
            sectionId: requiresSectionIds
              ? (featureSectionIds[index]?.sectionId?.trim() ?? undefined)
              : undefined,
          }),
        ),
        recreationTypeCode: values.recreationType || undefined,
        naturalResourceDistrictCode: values.metadata.districtCode || undefined,
        recreationDistrictCode: values.metadata.recreationDistrict || undefined,
        submittedBy: submittedBy || undefined,
      });

      setCreateStatus({
        variant: 'success',
        message: (
          <>
            Map feature request created successfully. Go to{' '}
            <a href={ROUTE_PATHS.REQUESTS}>request page</a> to view this
            request.
          </>
        ),
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

  const hasAllRequiredFields = missingRequiredFields.length === 0;
  const canCreateRequest =
    Boolean(editableFeatureCollection?.features?.length) &&
    hasAllRequiredFields &&
    !issues.some((issue) => issue.severity === 'ERROR');

  const getSelectedSectionFeature = () => {
    if (selectedFeatureIndex === null) {
      return null;
    }

    return featureSectionIds.at(selectedFeatureIndex) ?? null;
  };
  const selectedSectionFeature = getSelectedSectionFeature();
  const hasValidationErrors = issues.some(
    (issue) => issue.severity === 'ERROR',
  );
  const hasValidationSuccessNotice =
    Boolean(editableFeatureCollection?.features?.length) && issues.length === 0;

  return (
    <Card>
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Spatial submission</h2>
      </div>

      <div className="exhibit-a-section__grid">
        <SpatialSubmissionAlerts
          kind="notifications"
          hasValidationSuccessNotice={hasValidationSuccessNotice}
          showValidationSuccessNotice={showValidationSuccessNotice}
          onDismissValidationSuccessNotice={() =>
            setShowValidationSuccessNotice(false)
          }
          createStatus={createStatus}
          onDismissCreateStatus={() => setCreateStatus(null)}
          areDistrictOptionsErrored={areDistrictOptionsErrored}
          showDistrictOptionsNotice={showDistrictOptionsNotice}
          onDismissDistrictOptionsNotice={() =>
            setShowDistrictOptionsNotice(false)
          }
        />

        <Row className="gy-3">
          <SpatialSubmissionFormFields
            values={values}
            setValues={setValues}
            setMetadata={setMetadata}
            hasMissingField={hasMissingField}
            recreationTypeOptions={recreationTypeOptions}
            naturalResourceDistrictOptions={naturalResourceDistrictOptions}
            recreationDistrictOptions={recreationDistrictOptions}
            areDistrictOptionsLoading={areDistrictOptionsLoading}
            requestCreated={requestCreated}
            isProcessing={isProcessing}
            onSpatialFilesChange={handleSpatialFilesChange}
            onValidateSpatialFile={handleValidateSpatialFile}
          />

          <Col xs={12}>
            <SpatialSubmissionAlerts
              kind="validation"
              issues={issues}
              hasValidationErrors={hasValidationErrors}
            />
          </Col>

          <Col xs={12}>
            <SpatialSubmissionPreview
              editableFeatureCollection={editableFeatureCollection}
              requiresSectionIds={requiresSectionIds}
              featureSectionIds={featureSectionIds}
              selectedFeatureIndex={selectedFeatureIndex}
              setSelectedFeatureIndex={setSelectedFeatureIndex}
              selectedSectionFeature={selectedSectionFeature}
              onSectionIdChange={handleSectionIdChange}
              canCreateRequest={canCreateRequest}
              isCreatingRequest={isCreatingRequest}
              requestCreated={requestCreated}
              onCreateRequest={handleCreateRequest}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};

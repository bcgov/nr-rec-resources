import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useAuthContext } from '@/contexts/AuthContext';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import {
  ACCURACY_CODES,
  CAPTURE_METHODS,
  DATA_SOURCES,
  readSpatialFile,
  validateGeometry,
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
  const { data: districtOptionGroups, isLoading: areDistrictOptionsLoading } =
    useGetRecreationResourceOptions([
      GetOptionsByTypesTypesEnum.NaturalDistrict,
      GetOptionsByTypesTypesEnum.District,
      GetOptionsByTypesTypesEnum.ResourceType,
    ]);
  const [values, setValues] = useState<WizardValues>(defaultValues);
  const [file, setFile] = useState<File | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editableFeatureCollection, setEditableFeatureCollection] = useState<
    any | null
  >(null);

  const [naturalDistrictOptionsResponse, recreationDistrictOptionsResponse] =
    districtOptionGroups ?? [];
  const resourceTypeOptionsResponse = districtOptionGroups?.[2];

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
    const [nextFile] = Array.from(event.target.files ?? []);
    setFile(nextFile ?? null);
    setEditableFeatureCollection(null);
  };

  const handleValidateSpatialFile = async () => {
    setIsProcessing(true);

    const nextIssues: ValidationIssue[] = [];

    if (!file) {
      setEditableFeatureCollection(null);
      nextIssues.push({
        type: 'GEOMETRY',
        severity: 'ERROR',
        message: 'Please upload a .shp file.',
      });
      setIssues(nextIssues);
      setIsProcessing(false);
      return;
    }

    try {
      const parsed = await (
        readSpatialFile as (input: File | File[] | FileList) => Promise<any>
      )(file);
      const featureCollection = editableFeatureCollection ?? parsed;
      console.log('Extracted shapefile features:', {
        fileName: file.name,
        featureCount: featureCollection?.features?.length ?? 0,
        bbox: featureCollection?.bbox,
        crs: featureCollection?.crs,
        features: featureCollection?.features,
      });
      setEditableFeatureCollection(featureCollection);

      nextIssues.push(
        ...validateGeometry(featureCollection, {
          expectedSrsName: 'EPSG:3005',
          enforceExpectedSrsName: true,
          expectedGeometryType: values.featureType as
            | 'Point'
            | 'LineString'
            | 'Polygon',
        }),
      );

      setIssues(nextIssues);

      const hasBlockingErrors = nextIssues.some(
        (issue) => issue.severity === 'ERROR',
      );

      if (hasBlockingErrors) {
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      setEditableFeatureCollection(null);
      setIssues([
        ...nextIssues,
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

  return (
    <Card>
      <div className="exhibit-a-section__header">
        <h2 className="exhibit-a-section__title">Spatial submission</h2>
      </div>
      <div className="exhibit-a-section__grid">
        <Row className="gy-3">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Recreation Type</Form.Label>
              <Form.Select
                aria-label="Recreation Type"
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
                    ? 'Select recreation type'
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
              <Form.Label>Feature Type</Form.Label>
              <Form.Select
                aria-label="Feature Type"
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
                    value={district.label}
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
                    value={district.label}
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

          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label>Accuracy Code</Form.Label>
              <Form.Select
                aria-label="Accuracy Code"
                value={values.metadata.accuracyCode}
                onChange={(e) => setMetadata('accuracyCode', e.target.value)}
              >
                {ACCURACY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label>Capture Method</Form.Label>
              <Form.Select
                aria-label="Capture Method"
                value={values.metadata.captureMethod}
                onChange={(e) => setMetadata('captureMethod', e.target.value)}
              >
                {CAPTURE_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Data Source</Form.Label>
              <Form.Select
                aria-label="Data Source"
                value={values.metadata.dataSource}
                onChange={(e) => setMetadata('dataSource', e.target.value)}
              >
                {DATA_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Upload a Spatial File (.shp)</Form.Label>
              <Form.Control
                aria-label="Spatial File"
                type="file"
                accept=".shp"
                onChange={handleSpatialFilesChange}
              />
              <Form.Text muted>
                Select one `.shp` file for preview and spatial validation.
              </Form.Text>
            </Form.Group>
          </Col>

          <Col xs={12}>
            {editableFeatureCollection?.features?.length && (
              <>
                <Form.Label>Spatial Preview</Form.Label>
                <SpatialSubmissionMap
                  features={editableFeatureCollection.features}
                />
              </>
            )}
          </Col>

          <Col xs={12} className="d-flex gap-2">
            <Button
              variant="primary"
              disabled={isProcessing}
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
      </div>
    </Card>
  );
};

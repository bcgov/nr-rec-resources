import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button, Col, Form, Spinner } from 'react-bootstrap';
import { FEATURE_TYPE_OPTIONS } from './SpatialSubmissionSection.constants';
import type {
  RequiredFieldKey,
  SpatialOption,
  WizardValues,
} from './SpatialSubmissionSection.types';
import type { SubmissionMetadata } from './spatialSubmissionUtils';

const POLYGON_RECREATION_TYPE_LABELS = [
  'Interpretive forest',
  'Recreation Reserve',
  'Recreation Site',
  'Trail based recreation area',
] as const;

const LINEAR_RECREATION_TYPE_LABELS = [
  'Interpretive forest trail',
  'Recreation trail established',
  'Rec trail established',
  'Recreation trail reserve',
  'Trail based recreation linear',
] as const;

const normalizeOptionLabel = (label?: string | null): string =>
  (label ?? '').trim().toLowerCase();

const getDistrictOptionLabel = (district: SpatialOption): string => {
  const label = district.label?.trim() ?? '';
  const abbreviation = district.id?.trim() ?? '';

  if (label && abbreviation) {
    return `${label} (${abbreviation})`;
  }

  return label || abbreviation;
};

interface SpatialSubmissionFormFieldsProps {
  values: WizardValues;
  setValues: Dispatch<SetStateAction<WizardValues>>;
  setMetadata: (name: keyof SubmissionMetadata, value: string) => void;
  hasMissingField: (field: RequiredFieldKey) => boolean;
  recreationTypeOptions: SpatialOption[];
  naturalResourceDistrictOptions?: SpatialOption[];
  recreationDistrictOptions?: SpatialOption[];
  areDistrictOptionsLoading?: boolean;
  requestCreated: boolean;
  isProcessing: boolean;
  onSpatialFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onValidateSpatialFile: () => void;
  variant?: 'full' | 'geospatial';
  editMode?: boolean;
  showCreateHeading?: boolean;
  onCancel?: () => void;
}

export const SpatialSubmissionFormFields = ({
  values,
  setValues,
  setMetadata,
  hasMissingField,
  recreationTypeOptions,
  naturalResourceDistrictOptions,
  recreationDistrictOptions,
  areDistrictOptionsLoading,
  requestCreated,
  isProcessing,
  onSpatialFilesChange,
  onValidateSpatialFile,
  variant = 'full',
  editMode = false,
  showCreateHeading = false,
  onCancel,
}: SpatialSubmissionFormFieldsProps) => {
  const isGeospatialVariant = variant === 'geospatial';
  const normalizedNaturalResourceDistrictOptions =
    naturalResourceDistrictOptions ?? [];
  const normalizedRecreationDistrictOptions = recreationDistrictOptions ?? [];
  const isDistrictOptionsLoading = areDistrictOptionsLoading ?? false;
  const groupedOptionLookup = new Set<string>();
  const polygonOptions = POLYGON_RECREATION_TYPE_LABELS.flatMap(
    (targetLabel) => {
      const match = recreationTypeOptions.find(
        (option) =>
          normalizeOptionLabel(option.label) ===
          normalizeOptionLabel(targetLabel),
      );
      if (match?.id) {
        groupedOptionLookup.add(match.id);
      }
      return match ? [match] : [];
    },
  );

  const linearOptions = LINEAR_RECREATION_TYPE_LABELS.flatMap((targetLabel) => {
    const match = recreationTypeOptions.find(
      (option) =>
        normalizeOptionLabel(option.label) ===
        normalizeOptionLabel(targetLabel),
    );
    if (match?.id) {
      groupedOptionLookup.add(match.id);
    }
    return match ? [match] : [];
  });

  const ungroupedOptions = recreationTypeOptions.filter(
    (option) => !option.id || !groupedOptionLookup.has(option.id),
  );

  return (
    <>
      {!isGeospatialVariant ? (
        <Col xs={12}>
          <h4 className={showCreateHeading ? 'mb-0' : 'mb-0 mt-2'}>
            Recreation information
          </h4>
        </Col>
      ) : null}

      {!isGeospatialVariant ? (
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Recreation name (Optional)</Form.Label>
            <Form.Control
              aria-label="Recreation Name"
              value={values.recreationName}
              placeholder="Optional"
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  recreationName: e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>
      ) : null}

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
            {polygonOptions.length ? (
              <optgroup label="Polygon">
                {polygonOptions.map((typeOption) => (
                  <option key={typeOption.id} value={typeOption.id}>
                    {typeOption.label}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {linearOptions.length ? (
              <optgroup label="Linear">
                {linearOptions.map((typeOption) => (
                  <option key={typeOption.id} value={typeOption.id}>
                    {typeOption.label}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {ungroupedOptions.map((typeOption) => (
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

      {!isGeospatialVariant ? (
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Natural Resource District</Form.Label>
            <Form.Select
              aria-label="Natural Resource District"
              disabled={isDistrictOptionsLoading}
              required
              isInvalid={hasMissingField('districtCode') && !editMode}
              value={values.metadata.districtCode}
              onChange={(e) => setMetadata('districtCode', e.target.value)}
            >
              <option value="">
                {isDistrictOptionsLoading
                  ? 'Loading districts...'
                  : 'Select district'}
              </option>
              {normalizedNaturalResourceDistrictOptions.map((district) => (
                <option key={district.id ?? district.label} value={district.id}>
                  {getDistrictOptionLabel(district)}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              This is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      ) : null}

      {!isGeospatialVariant ? (
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Label>Recreation District</Form.Label>
            <Form.Select
              aria-label="Recreation District"
              disabled={isDistrictOptionsLoading}
              required
              isInvalid={hasMissingField('recreationDistrict') && !editMode}
              value={values.metadata.recreationDistrict}
              onChange={(e) =>
                setMetadata('recreationDistrict', e.target.value)
              }
            >
              <option value="">
                {isDistrictOptionsLoading
                  ? 'Loading districts...'
                  : 'Select district'}
              </option>
              {normalizedRecreationDistrictOptions.map((district) => (
                <option key={district.id ?? district.label} value={district.id}>
                  {getDistrictOptionLabel(district)}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              This is required.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      ) : null}

      <Col xs={12} md={6}>
        <Form.Group>
          <Form.Label>Rec #</Form.Label>
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

      {!isGeospatialVariant ? (
        <Col xs={12}>
          <h4 className="mb-0 mt-3">Contact information</h4>
        </Col>
      ) : null}

      <Col xs={12} md={6}>
        <Form.Group>
          <Form.Label>Submitter name</Form.Label>
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
          <Form.Label>Email address</Form.Label>
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

      {!isGeospatialVariant ? (
        <Col xs={12}>
          <h4 className="mb-0 mt-3">Upload spatial file</h4>
        </Col>
      ) : null}

      <Col xs={12}>
        <Form.Group>
          <Form.Label>
            {isGeospatialVariant ? 'Upload Spatial File (.zip)' : 'Select file'}
          </Form.Label>
          <Form.Control
            aria-label="Spatial File"
            type="file"
            accept=".zip,.shp,.dbf"
            multiple
            onChange={onSpatialFilesChange}
            disabled={requestCreated}
          />
          <Form.Text muted>
            File must be a Shape file as a single .zip bundle.
          </Form.Text>
        </Form.Group>
      </Col>

      <Col xs={12} className="spatial-submission-section__actions mt-4">
        <Button
          variant="primary"
          className="spatial-submission-section__validate-button"
          disabled={isProcessing || requestCreated}
          onClick={onValidateSpatialFile}
        >
          {isProcessing ? (
            <>
              <Spinner as="span" size="sm" className="me-2" />
              Validating...
            </>
          ) : (
            'Validate'
          )}
        </Button>
        {onCancel ? (
          <Button
            variant="outline-primary"
            className="spatial-submission-section__cancel-button"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </Col>
    </>
  );
};

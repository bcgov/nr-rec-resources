import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Button, Col, Form, Spinner } from 'react-bootstrap';
import { FEATURE_TYPE_OPTIONS } from './SpatialSubmissionSection.constants';
import type {
  RequiredFieldKey,
  SpatialOption,
  WizardValues,
} from './SpatialSubmissionSection.types';
import type { SubmissionMetadata } from './spatialSubmissionUtils';

interface SpatialSubmissionFormFieldsProps {
  values: WizardValues;
  setValues: Dispatch<SetStateAction<WizardValues>>;
  setMetadata: (name: keyof SubmissionMetadata, value: string) => void;
  hasMissingField: (field: RequiredFieldKey) => boolean;
  recreationTypeOptions: SpatialOption[];
  naturalResourceDistrictOptions: SpatialOption[];
  recreationDistrictOptions: SpatialOption[];
  areDistrictOptionsLoading: boolean;
  requestCreated: boolean;
  isProcessing: boolean;
  onSpatialFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onValidateSpatialFile: () => void;
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
}: SpatialSubmissionFormFieldsProps) => {
  return (
    <>
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
              <option key={district.id ?? district.label} value={district.id}>
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
            onChange={(e) => setMetadata('recreationDistrict', e.target.value)}
          >
            <option value="">
              {areDistrictOptionsLoading
                ? 'Loading districts...'
                : 'Select district'}
            </option>
            {recreationDistrictOptions.map((district) => (
              <option key={district.id ?? district.label} value={district.id}>
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
            onChange={onSpatialFilesChange}
            disabled={requestCreated}
          />
          <Form.Text muted>
            Upload your shapefile as a single .zip bundle.
          </Form.Text>
        </Form.Group>
      </Col>

      <Col xs={12} className="spatial-submission-section__actions mb-5 mt-5">
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
      </Col>
    </>
  );
};

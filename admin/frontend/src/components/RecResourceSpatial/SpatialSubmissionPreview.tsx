import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleInfo } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { SpatialSubmissionMap } from './SpatialSubmissionMap';
import type { FeatureSectionId } from './spatialSubmissionUtils';
import type { SpatialFeatureCollection } from './spatialSubmission.types';

interface SpatialSubmissionPreviewProps {
  editableFeatureCollection: SpatialFeatureCollection | null;
  requiresSectionIds: boolean;
  featureSectionIds: FeatureSectionId[];
  selectedFeatureIndex: number | null;
  setSelectedFeatureIndex: (index: number | null) => void;
  selectedSectionFeature: FeatureSectionId | null;
  onSectionIdChange: (nextSectionId: string) => void;
  canCreateRequest: boolean;
  isCreatingRequest: boolean;
  requestCreated: boolean;
  onCreateRequest: () => void;
}

export const SpatialSubmissionPreview = ({
  editableFeatureCollection,
  requiresSectionIds,
  featureSectionIds,
  selectedFeatureIndex,
  setSelectedFeatureIndex,
  selectedSectionFeature,
  onSectionIdChange,
  canCreateRequest,
  isCreatingRequest,
  requestCreated,
  onCreateRequest,
}: SpatialSubmissionPreviewProps) => {
  if (!editableFeatureCollection?.features?.length) {
    return null;
  }

  return (
    <>
      <Form.Label>Spatial preview</Form.Label>
      {requiresSectionIds && featureSectionIds.length > 0 && (
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
            Click a section in the list or on the map to rename it before
            creating the request.
          </span>
        </Alert>
      )}

      <Col xs={12} className="mt-3 mb-3">
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
                </Card>
              </Col>
              <Col xs={12} lg={7}>
                {selectedSectionFeature && (
                  <Form.Group>
                    <Form.Control
                      aria-label="Section ID / name"
                      value={selectedSectionFeature.sectionId ?? ''}
                      onChange={(event) =>
                        onSectionIdChange(event.target.value)
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
          requiresSectionIds &&
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
        disabled={!canCreateRequest || isCreatingRequest || requestCreated}
        onClick={onCreateRequest}
      >
        {isCreatingRequest ? (
          <>
            <Spinner as="span" size="sm" className="me-2" />
            Creating request...
          </>
        ) : (
          'Create request'
        )}
      </Button>
    </>
  );
};

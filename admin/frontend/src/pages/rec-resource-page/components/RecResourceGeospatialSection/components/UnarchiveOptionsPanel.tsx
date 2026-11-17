import { ComponentProps, useState } from 'react';
import {
  Alert,
  Button,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { SpatialSubmissionMap } from '@/components/RecResourceSpatial/SpatialSubmissionMap';
import { TRAIL_TYPE_CODES } from '@/constants/geospatial';
import './UnarchiveOptionsPanel.scss';

type MapFeatures = ComponentProps<typeof SpatialSubmissionMap>['features'];
type RestoreChoice = 'reuse' | 'upload';

// TODO: replace with the official expansion of SNCSC used by your team.
const SNCSC_DESCRIPTION =
  'The spatial review service that checks boundaries before a file is Issued.';

const Sncsc = () => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="sncsc-tooltip">{SNCSC_DESCRIPTION}</Tooltip>}
  >
    <abbr
      tabIndex={0}
      title={SNCSC_DESCRIPTION}
      className="unarchive-panel__abbr"
    >
      SNCSC
    </abbr>
  </OverlayTrigger>
);

const formatArchivedAge = (hours: number | null) => {
  if (hours == null) return null;
  if (hours < 1) return 'less than an hour ago';
  if (hours < 48) {
    const h = Math.floor(hours);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  return `${Math.floor(hours / 24)} days ago`;
};

interface Props {
  features: MapFeatures;
  resourceTypeCode?: string | null;
  /** ISO date the file was archived (best available). */
  archivedAt?: string | null;
  /** Hours since archive; null when unknown. */
  archiveAgeHours: number | null;
  totalAreaHectares?: number | null;
  totalLengthKm?: number | null;
  isBusy?: boolean;
  onReuse: () => void;
  onUploadNew: () => void;
  onCancel: () => void;
}

export function UnarchiveOptionsPanel({
  features,
  resourceTypeCode,
  archivedAt,
  archiveAgeHours,
  totalAreaHectares,
  totalLengthKm,
  isBusy = false,
  onReuse,
  onUploadNew,
  onCancel,
}: Props) {
  const hasExistingSpatial = features.length > 0;
  const needsResubmit = archiveAgeHours != null && archiveAgeHours >= 24;
  const isTrailResource = TRAIL_TYPE_CODES.includes(resourceTypeCode ?? '');
  const hasLineFeatures = features.some((feature) => {
    const geometryType = feature.geometry?.type;
    return geometryType === 'LineString' || geometryType === 'MultiLineString';
  });
  const featureCountLabel = isTrailResource
    ? 'Segments'
    : hasLineFeatures
      ? 'Lines'
      : 'Polygons';
  const [choice, setChoice] = useState<RestoreChoice>(
    hasExistingSpatial ? 'reuse' : 'upload',
  );

  const archivedDate = archivedAt
    ? new Date(archivedAt).toLocaleDateString('en-CA')
    : null;
  const age = formatArchivedAge(archiveAgeHours);

  const primaryLabel =
    choice === 'upload'
      ? 'Continue to upload'
      : needsResubmit
        ? 'Resubmit and restore'
        : 'Restore';

  const handlePrimary = () => (choice === 'upload' ? onUploadNew() : onReuse());

  const details: Array<[string, string]> = [
    ['Archived', [archivedDate, age].filter(Boolean).join(' · ') || '-'],
    [featureCountLabel, String(features.length)],
    ...(totalAreaHectares != null
      ? ([['Area', `${totalAreaHectares.toLocaleString('en-CA')} ha`]] as Array<
          [string, string]
        >)
      : []),
    ...(totalLengthKm != null
      ? ([['Length', `${totalLengthKm.toLocaleString('en-CA')} km`]] as Array<
          [string, string]
        >)
      : []),
  ];

  return (
    <section
      className="unarchive-panel mt-4 pt-3 border-top"
      aria-labelledby="unarchive-panel-title"
    >
      <Alert variant="info" className="d-flex gap-3 align-items-start">
        <FontAwesomeIcon icon={faCircleInfo} className="mt-1" aria-hidden />
        <div>
          <h3 id="unarchive-panel-title" className="h6 mb-1">
            Spatial data is archived
            {age ? <span className="fw-normal"> {age}</span> : null}
          </h3>
          <div className="mb-0">
            This file is currently <strong>Archived</strong>. Choose one option
            to return it to <strong>Issued</strong>.
          </div>
        </div>
      </Alert>

      {hasExistingSpatial ? (
        <div className="unarchive-panel__overview mb-4">
          <div className="unarchive-panel__map">
            <div className="fw-semibold mb-2">Archived spatial data</div>
            <div className="geospatial-section__modal-map-preview">
              <SpatialSubmissionMap
                features={features}
                selectedFeatureIndex={null}
                compact={true}
              />
            </div>
          </div>
          <dl className="unarchive-panel__details">
            {details.map(([label, value]) => (
              <div key={label} className="unarchive-panel__detail-row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <Alert variant="light" className="mb-4">
          No existing spatial data is available to reuse. Upload a new
          submission to restore this file.
        </Alert>
      )}

      <fieldset className="unarchive-panel__options" disabled={isBusy}>
        <legend className="h6 mb-3">
          How do you want to restore this file?
        </legend>

        <label
          htmlFor="unarchive-choice-reuse"
          className={`unarchive-option ${choice === 'reuse' ? 'unarchive-option--selected' : ''} ${!hasExistingSpatial ? 'unarchive-option--disabled' : ''}`}
        >
          <input
            id="unarchive-choice-reuse"
            type="radio"
            name="unarchive-choice"
            className="form-check-input"
            checked={choice === 'reuse'}
            disabled={!hasExistingSpatial}
            onChange={() => setChoice('reuse')}
          />
          <span>
            <span className="unarchive-option__title">
              Reuse existing data
              {hasExistingSpatial && !needsResubmit ? (
                <span className="badge text-bg-primary ms-2">Recommended</span>
              ) : null}
            </span>
            <span className="unarchive-option__body">
              {needsResubmit ? (
                <>
                  Land status or conflicts may have changed since this was
                  archived. Existing boundaries will be resubmitted to <Sncsc />{' '}
                  before the file is restored.
                </>
              ) : (
                <>
                  Returns the file to <strong>Issued</strong> right away. No new{' '}
                  <Sncsc /> request is needed.
                </>
              )}
            </span>
          </span>
        </label>

        <label
          htmlFor="unarchive-choice-upload"
          className={`unarchive-option ${choice === 'upload' ? 'unarchive-option--selected' : ''}`}
        >
          <input
            id="unarchive-choice-upload"
            type="radio"
            name="unarchive-choice"
            className="form-check-input"
            checked={choice === 'upload'}
            onChange={() => setChoice('upload')}
          />
          <span>
            <span className="unarchive-option__title">
              Upload a new submission
            </span>
            <span className="unarchive-option__body">
              Use this when boundaries have changed. New spatial files are
              submitted to <Sncsc /> for review.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={isBusy}
        >
          Cancel{' '}
        </Button>
        <Button variant="primary" onClick={handlePrimary} disabled={isBusy}>
          {isBusy ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Restoring…
            </>
          ) : (
            primaryLabel
          )}
        </Button>
      </div>
    </section>
  );
}

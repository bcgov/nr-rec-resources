import { FC, memo, useEffect, useState } from 'react';
import type Feature from 'ol/Feature';
import { Button, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExternalLink,
  faLocationDot,
  faRulerCombined,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import {
  FIRE_STATUS_COLOUR_MAP,
  WILDFIRE_LOCATION_LAYER,
} from '@/components/search-map/constants';
import { formatDateTimeFull } from '@shared/utils';
import WILDFIRE_ICON from '@shared/assets/icons/wildfire/active_wildfire.svg';
import '@/components/search-map/preview/MapFeaturePreview.scss';
import '@/components/search-map/preview/WildfireFeaturePreview.scss';

const WILDFIRE_BC_URL = 'https://wildfiresituation.nrs.gov.bc.ca/map';

export interface WildfirePreviewProps {
  onClose?: () => void;
  feature: Feature;
  type: 'location' | 'perimeter';
}

interface FireStatusCircleProps {
  fireStatus: string;
  size?: number;
  outline?: boolean;
}

const FireStatusCircle: FC<FireStatusCircleProps> = memo(
  ({ fireStatus, size = 24, outline = false }) => {
    const colour = FIRE_STATUS_COLOUR_MAP[fireStatus] || '#B5E261';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: '0.5rem', flexShrink: 0 }}
      >
        <circle
          cx="16"
          cy="16"
          r="15"
          fill={outline ? 'none' : colour}
          stroke={colour}
          strokeWidth={outline ? 3 : 2}
        />
      </svg>
    );
  },
);

const WildfirePreview: FC<WildfirePreviewProps> = ({
  onClose,
  feature,
  type,
}) => {
  const props = feature.getProperties();

  const fireNumber: string | undefined = props.FIRE_NUMBER;
  const fireStatus: string | undefined = props.FIRE_STATUS;
  const featureFireUrl: string | undefined = props.FIRE_URL;

  // location-only fields
  const ignitionDate: string | undefined = props.IGNITION_DATE;
  const currentSize: number | undefined = props.CURRENT_SIZE;
  const directGeographicDescription: string | undefined =
    props.GEOGRAPHIC_DESCRIPTION;

  // perimeter-only fields
  const trackDate: string | undefined = props.TRACK_DATE;
  const fireSizeHectares: number | undefined = props.FIRE_SIZE_HECTARES;

  const [fetchedGeographicDescription, setFetchedGeographicDescription] =
    useState<string | null>(null);

  useEffect(() => {
    if (type !== 'perimeter' || !fireNumber) return;
    const url =
      `${WILDFIRE_LOCATION_LAYER}/query/?f=json` +
      `&where=${encodeURIComponent(`FIRE_NUMBER='${fireNumber}'`)}` +
      `&outFields=GEOGRAPHIC_DESCRIPTION` +
      `&resultRecordCount=1`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const desc = data?.features?.[0]?.attributes?.GEOGRAPHIC_DESCRIPTION;
        setFetchedGeographicDescription(desc ?? null);
        return desc;
      })
      .catch(() => {});
  }, [type, fireNumber]);

  const geographicDescription =
    type === 'location'
      ? directGeographicDescription
      : fetchedGeographicDescription;

  const displaySize =
    type === 'location'
      ? currentSize != null
        ? `${currentSize} Hectares`
        : null
      : fireSizeHectares != null
        ? `${Number(fireSizeHectares).toLocaleString()} Hectares`
        : null;

  const displayDate = type === 'location' ? ignitionDate : trackDate;

  const fireUrl =
    featureFireUrl ||
    (fireNumber
      ? `${WILDFIRE_BC_URL}?fireNumber=${fireNumber}`
      : WILDFIRE_BC_URL);

  return (
    <section className="map-feature-preview">
      <div className="map-feature-preview-card wildfire-preview-card">
        <header className="wildfire-preview-header">
          <span>
            <Image src={WILDFIRE_ICON} alt="Wildfire BC Icon" />
            WildfireBC
          </span>
          <button
            type="button"
            className="preview-close-btn d-block d-sm-none"
            onClick={onClose}
            aria-label="Close preview"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className="wildfire-preview-content">
          <div className="d-flex justify-content-between align-items-center mb-sm-2">
            {fireNumber && (
              <div className="fire-number">Fire #: {fireNumber}</div>
            )}
            <a
              href={fireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="d-none d-sm-block fw-bold"
            >
              Full details <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </div>

          <div className="wildfire-preview-details">
            {fireStatus && (
              <p>
                <FireStatusCircle
                  fireStatus={fireStatus}
                  outline={type === 'perimeter'}
                />{' '}
                {fireStatus}
              </p>
            )}
            {displayDate && (
              <p>
                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                Discovered on{' '}
                {formatDateTimeFull(displayDate, {
                  timeZone: 'America/Vancouver',
                  timeZoneName: 'short',
                })}
              </p>
            )}
            {displaySize && (
              <p>
                <FontAwesomeIcon
                  icon={faRulerCombined}
                  className="me-2 fa-rotate-90"
                />
                {displaySize}
              </p>
            )}
            {geographicDescription && (
              <p>
                <FontAwesomeIcon icon={faLocationDot} className="me-2" />
                {geographicDescription}
              </p>
            )}

            <Button
              as="a"
              href={fireUrl}
              target="_blank"
              className="fire-url-btn d-sm-none"
              rel="noopener noreferrer"
              variant="primary"
            >
              Full details{' '}
              <FontAwesomeIcon icon={faExternalLink} className="ms-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WildfirePreview;

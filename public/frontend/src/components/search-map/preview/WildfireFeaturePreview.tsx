import { FC, memo } from 'react';
import type Feature from 'ol/Feature';
import { Button, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExternalLink,
  faLocationDot,
  faRulerCombined,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FIRE_STATUS_COLOUR_MAP } from '@/components/search-map/constants';
import { formatDateFull } from '@shared/utils';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import WILDFIRE_ICON from '@shared/assets/icons/wildfire_bc.svg';
import '@/components/search-map/preview/MapFeaturePreview.scss';
import '@/components/search-map/preview/WildfireFeaturePreview.scss';

interface WildfireFeaturePreviewProps {
  onClose?: () => void;
  wildfireFeature: Feature;
}

interface FireStatusProps {
  fireStatus: string;
  size?: number;
}

const FireStatus: FC<FireStatusProps> = memo(({ fireStatus, size = 24 }) => {
  const fillColor = FIRE_STATUS_COLOUR_MAP[fireStatus] || '#B5E261';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        fill={fillColor}
        stroke="#1A1A1A"
        strokeWidth="2"
      />
    </svg>
  );
});

const WildfireFeaturePreview: React.FC<WildfireFeaturePreviewProps> = ({
  onClose,
  wildfireFeature,
}) => {
  const {
    FIRE_NUMBER: fireNumber,
    FIRE_STATUS: fireStatus,
    IGNITION_DATE: ignitionDate,
    CURRENT_SIZE: currentSize,
    GEOGRAPHIC_DESCRIPTION: geographicDescription,
    FIRE_URL: fireUrl,
  } = wildfireFeature.getProperties();

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
              Full details
              <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </div>
          <div className="wildfire-preview-details">
            {fireStatus && (
              <p>
                <FireStatus fireStatus={fireStatus} /> {fireStatus}
              </p>
            )}
            {ignitionDate && (
              <p>
                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                Discovered on {formatDateFull(ignitionDate)}
              </p>
            )}
            {currentSize && (
              <p>
                <FontAwesomeIcon
                  icon={faRulerCombined}
                  className="me-2 fa-rotate-90"
                />
                {currentSize} Hectares
              </p>
            )}
            {geographicDescription && (
              <p>
                <FontAwesomeIcon icon={faLocationDot} className="me-2" />
                {geographicDescription}
              </p>
            )}
            {fireUrl && (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WildfireFeaturePreview;

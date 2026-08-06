import type Feature from 'ol/Feature';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExternalLink,
  faBuilding,
  faCalendar,
  faXmark,
  faTriangleExclamation,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import '@/components/search-map/preview/MapFeaturePreview.scss';
import '@/components/search-map/preview/FireEvacuationPreview.scss';
import alertIcon from '@/assets/alert_icon.svg';
import { EXTERNAL_LINKS } from '@/constants/urls';

const EMERGENCY_INFO_BC_URL = EXTERNAL_LINKS.EMERGENCY_INFO_BC;

interface FireEvacuationPreviewProps {
  onClose?: () => void;
  evacuationFeature: Feature;
}

const STATUS_CLASS: Record<string, string> = {
  Order: 'status-order',
  'Tactical Evacuation': 'status-tactical',
  Alert: 'status-alert',
  'All Clear': 'status-all-clear',
};

const FireEvacuationPreview: React.FC<FireEvacuationPreviewProps> = ({
  onClose,
  evacuationFeature,
}) => {
  const {
    ORDER_ALERT_STATUS: status,
    ORDER_ALERT_NAME: alertName,
    EVENT_NAME: eventName,
    EVENT_TYPE: eventType,
    ISSUING_AGENCY: issuingAgency,
    DATE_MODIFIED: dateModified,
  } = evacuationFeature.getProperties();

  const displayName = alertName || eventName;
  const statusClass = STATUS_CLASS[status] ?? 'status-order';

  const formattedDate = dateModified
    ? new Date(dateModified).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <section className="map-feature-preview">
      <div className="map-feature-preview-card evacuation-preview-card">
        <header className={`evacuation-preview-header ${statusClass}`}>
          <span>
            <span className="evacuation-header-icon">
              <img
                src={alertIcon}
                alt=""
                aria-hidden="true"
                width="39"
                height="39"
              />
            </span>
            <span className="evacuation-header-text">
              <span>Evacuation</span>
              {status && <span>{status}</span>}
            </span>
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

        <div className="evacuation-preview-content">
          <div className="d-flex justify-content-between align-items-center mb-sm-2">
            {displayName && (
              <div className="evacuation-name">{displayName}</div>
            )}
          </div>

          <div className="evacuation-preview-details">
            {status && (
              <p>
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="me-2"
                />
                {status}
              </p>
            )}
            {eventType && (
              <p>
                <FontAwesomeIcon icon={faTag} className="me-2" />
                {eventType}
              </p>
            )}
            {issuingAgency && (
              <p>
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                {issuingAgency}
              </p>
            )}
            {formattedDate && (
              <p>
                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                Last updated: {formattedDate}
              </p>
            )}

            <p className="evacuation-footer-text">
              Visit{' '}
              <a
                href={EMERGENCY_INFO_BC_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                EmergencyInfoBC
              </a>{' '}
              for more information.
            </p>

            <Button
              as="a"
              href={EMERGENCY_INFO_BC_URL}
              target="_blank"
              className="evacuation-info-btn d-sm-none"
              rel="noopener noreferrer"
              variant="primary"
            >
              EmergencyInfoBC{' '}
              <FontAwesomeIcon icon={faExternalLink} className="ms-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FireEvacuationPreview;

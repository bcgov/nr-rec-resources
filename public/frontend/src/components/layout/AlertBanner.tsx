import { useState } from 'react';
import {
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/components/layout/AlertBanner.scss';

const AlertBanner = () => {
  const message = import.meta.env.VITE_ALERT_BANNER_MESSAGE?.trim();
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  return (
    <div className="alert-banner" role="region" aria-label="Site alert">
      <div className="alert-banner__content">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="alert-banner__icon"
          aria-hidden="true"
        />
        <p className="alert-banner__message">{message}</p>
        <button
          type="button"
          className="alert-banner__close"
          aria-label="Dismiss alert"
          onClick={() => setDismissed(true)}
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;

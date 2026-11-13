import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EditModeBanner.scss';

export const EDIT_MODE_MESSAGE = 'You are now editing';

export function EditModeBanner() {
  return (
    <div className="edit-mode-banner" role="status">
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="edit-mode-banner__icon"
        aria-hidden="true"
      />
      <span>{EDIT_MODE_MESSAGE}</span>
    </div>
  );
}

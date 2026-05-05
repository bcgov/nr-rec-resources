import { faCircleInfo } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Alert } from 'react-bootstrap';
import { COLOR_BLACK, COLOR_BLUE_DARK } from '@/styles/colors';
import './ArchivedNotice.scss';

export const ARCHIVED_TITLE = 'Recreation resource archived';
export const ARCHIVED_MESSAGE =
  "This recreation resource is kept for reference and can't be edited.";

export function ArchivedNotice() {
  return (
    <Alert variant="light" dismissible={false} className="mb-0 archived-notice">
      <div className="notification-bar-container__content">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon
            icon={faCircleInfo as IconProp}
            data-testid="archived-icon"
            style={{ color: COLOR_BLUE_DARK }}
          />
          <strong style={{ color: COLOR_BLACK }}>{ARCHIVED_TITLE}</strong>
        </div>
        <div className="archived-notice__message">{ARCHIVED_MESSAGE}</div>
      </div>
    </Alert>
  );
}

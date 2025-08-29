import { NotificationMessage } from '@/store/notificationStore';
import {
  IconDefinition,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from 'react-bootstrap';
import './NotificationBar.scss';

const VARIANT_ICON_MAP: Record<
  'success' | 'danger' | 'warning' | 'info',
  IconDefinition
> = {
  success: faCheckCircle,
  danger: faTimesCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
};

export function NotificationBarIcon({ msg }: { msg: NotificationMessage }) {
  if (msg.type === 'spinner') {
    return (
      <span
        className="notification-bar-container__spinner"
        data-testid="notification-spinner"
      >
        <Spinner animation="border" size="sm" />
      </span>
    );
  }

  if (msg.type === 'status') {
    const icon = VARIANT_ICON_MAP[msg.variant];
    return <FontAwesomeIcon icon={icon} data-testid="notification-icon" />;
  }
  return null;
}

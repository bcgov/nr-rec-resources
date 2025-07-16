import {
  NotificationMessageVariant,
  notificationStore,
  removeNotification,
} from "@/store/notificationStore";
import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStore } from "@tanstack/react-store";
import { Alert, Stack, Toast } from "react-bootstrap";
import "./NotificationBar.scss";

// Map message variants to FontAwesome icon
const VARIANT_ICON_MAP: Record<NotificationMessageVariant, IconDefinition> = {
  success: faCheckCircle,
  danger: faTimesCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
};

/**
 * NotificationBar displays a stack of notification messages below the header.
 * Uses React-Bootstrap's Alert component for styling.
 *
 * @param {Object} props
 * @param {number} [props.top=93] - The top offset in pixels (should match header height).
 */
export function NotificationBar() {
  const { messages } = useStore(notificationStore);

  if (!messages.length) return null;

  return (
    <Stack direction="vertical" className="notification-bar-container" gap={1}>
      {messages.map(({ id, message, variant, timeout }) => {
        const icon = VARIANT_ICON_MAP[variant];
        const onClose = () => removeNotification(id);
        return (
          <Toast
            autohide
            delay={timeout}
            key={id}
            onClose={onClose}
            className="notification-bar-container__toast"
          >
            <Toast.Body className="notification-bar-container__toast-body">
              <Alert
                key={id}
                variant={variant}
                dismissible
                onClose={onClose}
                className="notification-bar-container__alert"
              >
                <Stack direction="horizontal" gap={2}>
                  <FontAwesomeIcon icon={icon} />
                  <span>{message}</span>
                </Stack>
              </Alert>
            </Toast.Body>
          </Toast>
        );
      })}
    </Stack>
  );
}

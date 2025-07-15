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
import { useEffect } from "react";
import { Alert, Stack } from "react-bootstrap";
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

  useEffect(() => {
    if (!messages.length) return;
    // Set up a timer for each message that should auto-dismiss
    const timers = messages
      .filter((msg) => msg.autoDismiss !== false)
      .map(({ id, timeout = 3000 }) =>
        setTimeout(() => removeNotification(id), timeout),
      );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [messages]);

  if (!messages.length) return null;

  return (
    <Stack direction="vertical" className="notification-bar-container" gap={1}>
      {messages.map(({ id, message, variant }) => {
        const icon = VARIANT_ICON_MAP[variant];
        return (
          <Alert
            key={id}
            variant={variant}
            dismissible
            onClose={() => removeNotification(id)}
            className="notification-bar-container__alert"
          >
            <Stack direction="horizontal" gap={2}>
              <FontAwesomeIcon icon={icon} />
              <span>{message}</span>
            </Stack>
          </Alert>
        );
      })}
    </Stack>
  );
}

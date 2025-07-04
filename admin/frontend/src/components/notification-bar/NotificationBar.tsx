import Alert from "react-bootstrap/Alert";
import { useStore } from "@tanstack/react-store";
import {
  notificationStore,
  removeNotification,
} from "@/store/notificationStore";
import { useEffect } from "react";
import "./NotificationBar.scss";

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
    <div className="notification-bar">
      {messages.map(({ id, message, variant }) => (
        <Alert
          key={id}
          variant={variant}
          dismissible
          onClose={() => removeNotification(id)}
          className="alert"
        >
          {message}
        </Alert>
      ))}
    </div>
  );
}

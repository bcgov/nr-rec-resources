import Alert from "react-bootstrap/Alert";
import { useStore } from "@tanstack/react-store";
import { hideNotification, notificationStore } from "@/store/notificationStore";

/**
 * NotificationBar displays a stack of notification messages below the header.
 * Uses React-Bootstrap's Alert component for styling.
 *
 * @param {Object} props
 * @param {number} [props.top=93] - The top offset in pixels (should match header height).
 */
export function NotificationBar({ top = 93 }) {
  const { messages } = useStore(notificationStore);

  if (!messages.length) return null;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "calc(100% - 10px)",
        zIndex: 9999,
        margin: 5,
        float: "none",
      }}
    >
      {messages.map(({ id, message, variant }) => (
        <Alert
          key={id}
          variant={variant}
          dismissible
          onClose={() => hideNotification(id)}
          style={{
            borderRadius: "12px",
            marginBottom: "5px",
          }}
        >
          {message}
        </Alert>
      ))}
    </div>
  );
}

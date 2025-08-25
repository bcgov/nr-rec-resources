import {
  notificationStore,
  removeNotification,
} from '@/store/notificationStore';
import { useStore } from '@tanstack/react-store';
import { Stack, ToastContainer } from 'react-bootstrap';
import './NotificationBar.scss';
import { NotificationToast } from './NotificationToast';

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
    <ToastContainer
      containerPosition="sticky"
      className="notification-bar-container"
    >
      <Stack direction="vertical" gap={1}>
        {messages.map((msg) => (
          <NotificationToast
            key={msg.id}
            msg={msg}
            onClose={() => removeNotification(msg.id)}
          />
        ))}
      </Stack>
    </ToastContainer>
  );
}

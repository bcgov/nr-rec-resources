import { NotificationMessage } from '@/store/notificationStore';
import { Alert, Stack, Toast } from 'react-bootstrap';
import { NotificationBarIcon } from './NotificationBarIcon';

interface NotificationToastProps {
  msg: NotificationMessage;
  onClose: () => void;
}

export function NotificationToast({ msg, onClose }: NotificationToastProps) {
  const isSpinner = msg.type === 'spinner';
  const alertVariant = isSpinner
    ? 'info'
    : msg.type === 'status'
      ? msg.variant
      : 'info';

  return (
    <Toast
      autohide={!isSpinner && msg.autoDismiss}
      delay={!isSpinner ? msg.timeout : undefined}
      key={msg.id}
      onClose={onClose}
      className="notification-bar-container__toast"
      role="status"
      aria-live="polite"
    >
      <Toast.Body className="notification-bar-container__toast-body">
        <Alert
          key={msg.id}
          variant={alertVariant}
          dismissible={!isSpinner}
          onClose={!isSpinner ? onClose : undefined}
          className="notification-bar-container__alert"
        >
          <Stack direction="horizontal" gap={2}>
            <NotificationBarIcon msg={msg} />
            <span>{msg.message}</span>
          </Stack>
        </Alert>
      </Toast.Body>
    </Toast>
  );
}

import { NotificationMessage } from '@/store/notificationStore';
import { Alert, Button, Stack, Toast } from 'react-bootstrap';
import { NotificationBarIcon } from './NotificationBarIcon';

interface NotificationToastProps {
  msg: NotificationMessage;
  onClose: () => void;
}

export function NotificationToast({ msg, onClose }: NotificationToastProps) {
  const isSpinner = msg.type === 'spinner';
  const actions = msg.type === 'status' ? msg.actions : undefined;
  const title = msg.type === 'status' ? msg.title : undefined;
  const alertVariant = isSpinner
    ? 'info'
    : msg.type === 'status'
      ? msg.variant
      : 'info';

  const handleClose = () => {
    if (msg.type === 'status' && msg.onDismiss) {
      msg.onDismiss();
    }
    onClose();
  };

  return (
    <Toast
      autohide={!isSpinner && msg.autoDismiss}
      delay={!isSpinner ? msg.timeout : undefined}
      key={msg.id}
      onClose={handleClose}
      className="notification-bar-container__toast"
      role="status"
      aria-live="polite"
    >
      <Toast.Body className="notification-bar-container__toast-body">
        <Alert
          key={msg.id}
          variant={alertVariant}
          dismissible={!isSpinner}
          onClose={handleClose}
          className="notification-bar-container__alert"
        >
          <div className="notification-bar-container__content">
            <Stack direction="horizontal" gap={2}>
              <NotificationBarIcon msg={msg} />
              <div>
                {title && (
                  <div className="notification-bar-container__title">
                    {title}
                  </div>
                )}
                <span>{msg.message}</span>
              </div>
            </Stack>
            {!!actions?.length && (
              <Stack
                direction="horizontal"
                gap={2}
                className="notification-bar-container__actions"
              >
                {actions.map((action, index) => (
                  <Button
                    key={`${msg.id}-action-${index}`}
                    size="sm"
                    variant={action.variant ?? 'primary'}
                    onClick={() => {
                      if (action.dismissOnClick !== false) onClose();
                      action.onClick();
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            )}
          </div>
        </Alert>
      </Toast.Body>
    </Toast>
  );
}

import { useEffect, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import '@/components/notifications/NotificationToast.scss';

type NotificationToastProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  messages?: string | string[];
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  autoHide?: boolean;
  delay?: number;
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  isOpen,
  onClose,
  title = 'Notification',
  messages = [],
  variant = 'primary',
  autoHide = false,
  delay = 5000,
}) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Toast
      show={show}
      onClose={handleClose}
      autohide={autoHide}
      delay={delay}
      bg={variant}
      aria-live="polite"
      aria-atomic="true"
    >
      <Toast.Header closeButton>
        <strong className="me-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>
        {Array.isArray(messages) ? (
          messages.map((msg) => <div key={msg}>{msg}</div>)
        ) : (
          <div>{messages}</div>
        )}
      </Toast.Body>
    </Toast>
  );
};

export default NotificationToast;

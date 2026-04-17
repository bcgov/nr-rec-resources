/**
 * Notification store using TanStack Store.
 * Provides global notification management as a collection of messages.
 */
import { Store } from '@tanstack/store';
import { AlertProps, ButtonProps } from 'react-bootstrap';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  dismissOnClick?: boolean;
}

export type NotificationMessage =
  | {
      id: string | number;
      type: 'status';
      title?: string;
      message: string;
      variant: Extract<
        AlertProps['variant'],
        'success' | 'danger' | 'warning' | 'info'
      >;
      actions?: NotificationAction[];
      autoDismiss?: boolean;
      timeout?: number;
      onDismiss?: () => void;
    }
  | {
      id: string | number;
      type: 'spinner';
      message: string;
      autoDismiss?: false;
    };

interface NotificationState {
  messages: NotificationMessage[];
}

export const notificationStore = new Store<NotificationState>({ messages: [] });

const getId = (id?: string | number) => id ?? crypto.randomUUID();

export const addStatusNotification = (
  message: string,
  variant: Extract<
    AlertProps['variant'],
    'success' | 'danger' | 'warning' | 'info'
  > = 'danger',
  id?: string | number,
  autoDismiss = true,
  timeout = 3000,
  actions?: NotificationAction[],
  title?: string,
  onDismiss?: () => void,
): void => {
  notificationStore.setState((prev) =>
    id && prev.messages.some((msg) => msg.id === id)
      ? prev
      : {
          messages: [
            ...prev.messages,
            {
              id: getId(id),
              type: 'status',
              title,
              message,
              variant,
              actions,
              autoDismiss,
              timeout,
              onDismiss,
            },
          ],
        },
  );
};

export const addSpinnerNotification = (
  message: string,
  id?: string | number,
): void => {
  notificationStore.setState((prev) =>
    id && prev.messages.some((msg) => msg.id === id)
      ? prev
      : {
          messages: [
            ...prev.messages,
            { id: getId(id), type: 'spinner', message, autoDismiss: false },
          ],
        },
  );
};

export const removeNotification = (id: string | number): void => {
  notificationStore.setState((prev) => ({
    messages: prev.messages.filter((msg) => msg.id !== id),
  }));
};

export const addSuccessNotification = (
  message: string,
  id?: string | number,
  autoDismiss = true,
  timeout = 10000,
): void => addStatusNotification(message, 'success', id, autoDismiss, timeout);

export const addInfoNotification = (
  message: string,
  id?: string | number,
  autoDismiss = true,
  timeout = 10000,
): void => addStatusNotification(message, 'info', id, autoDismiss, timeout);

export const addErrorNotification = (
  message: string,
  id?: string | number,
  autoDismiss = true,
  timeout = 10000,
): void => addStatusNotification(message, 'danger', id, autoDismiss, timeout);

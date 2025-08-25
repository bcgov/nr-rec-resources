/**
 * Notification store using TanStack Store.
 * Provides global notification management as a collection of messages.
 */
import { Store } from '@tanstack/store';
import { AlertProps } from 'react-bootstrap';

export type NotificationMessage =
  | {
      id: string | number;
      type: 'status';
      message: string;
      variant: Extract<
        AlertProps['variant'],
        'success' | 'danger' | 'warning' | 'info'
      >;
      autoDismiss?: boolean;
      timeout?: number;
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
              message,
              variant,
              autoDismiss,
              timeout,
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
  timeout = 3000,
): void => addStatusNotification(message, 'success', id, autoDismiss, timeout);

export const addInfoNotification = (
  message: string,
  id?: string | number,
  autoDismiss = true,
  timeout = 3000,
): void => addStatusNotification(message, 'info', id, autoDismiss, timeout);

export const addErrorNotification = (
  message: string,
  id?: string | number,
  autoDismiss = true,
  timeout = 3000,
): void => addStatusNotification(message, 'danger', id, autoDismiss, timeout);

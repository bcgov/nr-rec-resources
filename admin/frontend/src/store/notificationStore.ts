/**
 * Notification store using TanStack Store.
 * Provides global notification management as a collection of messages.
 */
import { Store } from "@tanstack/store";
import { AlertProps } from "react-bootstrap";

export interface NotificationMessage {
  id: string | number;
  message: string;
  variant: AlertProps["variant"];
  autoDismiss?: boolean;
  timeout?: number;
}

interface NotificationState {
  messages: NotificationMessage[];
}

export const notificationStore = new Store<NotificationState>({
  messages: [],
});

/**
 * Add a notification. Deduplicates by id if provided.
 * @param message - The notification message.
 * @param variant - The Bootstrap variant (default: 'danger').
 * @param id - Optional unique id for deduplication.
 * @param autoDismiss - Whether this notification should auto-dismiss (default: true).
 * @param timeout - Auto-dismiss timeout in ms (default: 3000).
 */
export function addNotification(
  message: string,
  variant: string = "danger",
  id?: string | number,
  autoDismiss: boolean = true,
  timeout: number = 3000,
): void {
  notificationStore.setState((prev) => {
    if (id && prev.messages.some((msg) => msg.id === id)) {
      return prev;
    }
    const msgId = id ?? Date.now() + Math.random();
    return {
      messages: [
        ...prev.messages,
        { id: msgId, message, variant, autoDismiss, timeout },
      ],
    };
  });
}

/**
 * Remove a notification by id.
 * @param id - The id of the notification to remove.
 */
export function removeNotification(id: string | number): void {
  notificationStore.setState((prev) => ({
    messages: prev.messages.filter((msg) => msg.id !== id),
  }));
}

/**
 * Add a success notification. Variant is always 'success'.
 * @param message - The notification message.
 * @param id - Optional unique id for deduplication.
 * @param autoDismiss - Whether this notification should auto-dismiss (default: true).
 * @param timeout - Auto-dismiss timeout in ms (default: 3000).
 */
export function addSuccessNotification(
  message: string,
  id?: string | number,
  autoDismiss: boolean = true,
  timeout: number = 3000,
): void {
  addNotification(message, "success", id, autoDismiss, timeout);
}

/**
 * Add an error notification. Variant is always 'danger'.
 * @param message - The notification message.
 * @param id - Optional unique id for deduplication.
 * @param autoDismiss - Whether this notification should auto-dismiss (default: true).
 * @param timeout - Auto-dismiss timeout in ms (default: 3000).
 */
export function addErrorNotification(
  message: string,
  id?: string | number,
  autoDismiss: boolean = true,
  timeout: number = 3000,
): void {
  addNotification(message, "danger", id, autoDismiss, timeout);
}

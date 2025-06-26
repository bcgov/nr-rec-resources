/**
 * Notification store using TanStack Store.
 * Provides global notification management as a collection of messages.
 */
import { Store } from "@tanstack/store";

export interface NotificationMessage {
  id: string | number;
  message: string;
  variant: string;
}

interface NotificationState {
  messages: NotificationMessage[];
}

export const notificationStore = new Store<NotificationState>({
  messages: [],
});

/**
 * Show a notification. Deduplicates by id if provided.
 * @param message - The notification message.
 * @param variant - The Bootstrap variant (default: 'danger').
 * @param id - Optional unique id for deduplication.
 */
export function showNotification(
  message: string,
  variant: string = "danger",
  id?: string | number,
): void {
  notificationStore.setState((prev) => {
    if (id && prev.messages.some((msg) => msg.id === id)) {
      return prev;
    }
    const msgId = id ?? Date.now() + Math.random();
    return {
      messages: [...prev.messages, { id: msgId, message, variant }],
    };
  });
}

/**
 * Hide a notification by id.
 * @param id - The id of the notification to remove.
 */
export function hideNotification(id: string | number): void {
  notificationStore.setState((prev) => ({
    messages: prev.messages.filter((msg) => msg.id !== id),
  }));
}

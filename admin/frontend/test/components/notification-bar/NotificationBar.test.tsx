import { NotificationBar } from '@/components/notification-bar';
import * as notificationStoreModule from '@/store/notificationStore';
import { useStore } from '@tanstack/react-store';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock NotificationToast
vi.mock('@/components/notification-bar/NotificationToast', () => ({
  NotificationToast: ({ msg, onClose }: any) => (
    <div data-testid="notification-toast" onClick={onClose}>
      {msg.text}
    </div>
  ),
}));

// Mock useStore from @tanstack/react-store
vi.mock('@tanstack/react-store', () => ({
  useStore: vi.fn(),
}));

const mockMessages = [
  { id: '1', text: 'Test message 1' },
  { id: '2', text: 'Test message 2' },
];

// Mock removeNotification
const removeNotificationMock = vi.spyOn(
  notificationStoreModule,
  'removeNotification',
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationBar', () => {
  it('renders nothing when there are no messages', () => {
    (useStore as any).mockReturnValue({ messages: [] });
    const { container } = render(<NotificationBar />);
    expect(container.firstChild).toBeNull();
  });

  it('renders notification toasts when messages exist', () => {
    (useStore as any).mockReturnValue({ messages: mockMessages });
    render(<NotificationBar />);
    const toasts = screen.getAllByTestId('notification-toast');
    expect(toasts).toHaveLength(mockMessages.length);
    expect(toasts[0]).toHaveTextContent('Test message 1');
    expect(toasts[1]).toHaveTextContent('Test message 2');
  });

  it('calls removeNotification when a toast is closed', () => {
    (useStore as any).mockReturnValue({ messages: mockMessages });
    render(<NotificationBar />);
    const toasts = screen.getAllByTestId('notification-toast');
    toasts[0].click();
    expect(removeNotificationMock).toHaveBeenCalledWith('1');
  });
});

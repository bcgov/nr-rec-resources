import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationToast from './NotificationToast';

describe('NotificationToast', () => {
  it('renders with default props and shows title', () => {
    render(<NotificationToast isOpen={true} />);
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });

  it('renders multiple messages when messages is an array', () => {
    const messages = ['First message', 'Second message'];
    render(<NotificationToast isOpen={true} messages={messages} />);
    messages.forEach((msg) => {
      expect(screen.getByText(msg)).toBeInTheDocument();
    });
  });

  it('renders single message when messages is a string', () => {
    render(<NotificationToast isOpen={true} messages="Single message" />);
    expect(screen.getByText('Single message')).toBeInTheDocument();
  });

  it('does not show toast when isOpen is false', () => {
    render(<NotificationToast isOpen={false} />);
    const notification = screen.queryByText('Notification');
    expect(notification).toBeNull();
  });

  it('calls onClose callback and hides toast when close button clicked', async () => {
    const onClose = vi.fn();
    render(<NotificationToast isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const notification = screen.queryByText('Notification');

      if (notification === null) {
        expect(notification).toBeNull();
      } else {
        expect(notification).not.toBeVisible();
      }
    });
  });

  it('applies the correct variant (background color)', () => {
    render(<NotificationToast isOpen={true} variant="danger" />);
    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveClass('bg-danger');
  });
});

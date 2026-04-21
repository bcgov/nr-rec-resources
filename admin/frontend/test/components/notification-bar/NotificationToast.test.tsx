import { NotificationToast } from '@/components/notification-bar/NotificationToast';
import { NotificationMessage } from '@/store/notificationStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock NotificationBarIcon to test icon rendering
vi.mock('@/components/notification-bar/NotificationBarIcon', () => ({
  NotificationBarIcon: () => <span data-testid="icon">ICON</span>,
}));

describe('NotificationToast', () => {
  const baseStatus: NotificationMessage = {
    id: 1,
    type: 'status',
    message: 'Status message',
    variant: 'success',
    autoDismiss: true,
    timeout: 3000,
  };
  const baseSpinner: NotificationMessage = {
    id: 2,
    type: 'spinner',
    message: 'Loading...',
    autoDismiss: false,
  };

  const statusWithActions: NotificationMessage = {
    id: 4,
    type: 'status',
    title: 'Session expired',
    message: 'Your session has expired because it reached the 10-hour limit.',
    variant: 'warning',
    autoDismiss: false,
    timeout: 0,
    actions: [
      {
        label: 'Sign in again',
        onClick: vi.fn(),
        variant: 'outline-secondary',
      },
    ],
  };

  it('renders status notification with correct variant', () => {
    render(<NotificationToast msg={baseStatus} onClose={() => {}} />);
    expect(screen.getByText('Status message')).toBeInTheDocument();
    // Use role="alert" instead of "status"
    expect(screen.getAllByRole('alert')[0]).toBeInTheDocument();
    expect(screen.getByText('Status message').closest('.alert')).toHaveClass(
      'alert-success',
    );
  });

  it('renders spinner notification and disables dismiss', () => {
    render(<NotificationToast msg={baseSpinner} onClose={() => {}} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
  });

  it('sets accessibility attributes on Toast', () => {
    render(<NotificationToast msg={baseStatus} onClose={() => {}} />);
    const toast = screen.getAllByRole('alert')[0];
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('calls onClose when close button is clicked for status notification', () => {
    const onClose = vi.fn();
    render(<NotificationToast msg={baseStatus} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders icon using NotificationBarIcon', () => {
    render(<NotificationToast msg={baseStatus} onClose={() => {}} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders notification with non-status/non-spinner type and uses info variant', () => {
    const customMsg = {
      id: 3,
      type: 'other',
      message: 'Custom message',
      autoDismiss: true,
      timeout: 2000,
      variant: 'info',
    } as unknown as NotificationMessage;
    render(<NotificationToast msg={customMsg} onClose={() => {}} />);
    expect(screen.getByText('Custom message').closest('.alert')).toHaveClass(
      'alert-info',
    );
  });

  it('renders status actions when provided', () => {
    render(<NotificationToast msg={statusWithActions} onClose={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Sign in again' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Session expired')).toBeInTheDocument();
  });

  it('runs action callback and closes by default when action is clicked', () => {
    const onClose = vi.fn();
    const actionClick = vi.fn();
    const messageWithAction: NotificationMessage = {
      ...statusWithActions,
      actions: [
        {
          label: 'Sign in again',
          onClick: actionClick,
          variant: 'primary',
        },
      ],
    };

    render(<NotificationToast msg={messageWithAction} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in again' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(actionClick).toHaveBeenCalledTimes(1);
  });

  it('does not close when dismissOnClick is false', () => {
    const onClose = vi.fn();
    const actionClick = vi.fn();
    const messageWithPersistentAction: NotificationMessage = {
      ...statusWithActions,
      actions: [
        {
          label: 'Retry',
          onClick: actionClick,
          dismissOnClick: false,
        },
      ],
    };

    render(
      <NotificationToast msg={messageWithPersistentAction} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(actionClick).toHaveBeenCalledTimes(1);
  });
});

import { NotificationBar } from '@/components/notification-bar/NotificationBar';
import {
  NotificationMessage,
  notificationStore,
} from '@/store/notificationStore';
import { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

const meta: Meta<typeof NotificationBar> = {
  title: 'Components/NotificationBar',
  component: NotificationBar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof NotificationBar>;

// Decorator to set up notification store state
const withNotifications = (messages: NotificationMessage[]) => {
  return (Story: any) => {
    useEffect(() => {
      // Set initial state
      notificationStore.setState({ messages });
      // Cleanup on unmount
      return () => {
        notificationStore.setState({ messages: [] });
      };
    }, []);
    return <Story />;
  };
};

export const SingleSuccess: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message: 'Resource saved successfully',
        variant: 'success',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const SingleError: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message: 'Failed to save resource. Please try again.',
        variant: 'danger',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const SingleWarning: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message: 'Some fields may need attention',
        variant: 'warning',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const SingleInfo: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message: 'Your changes have been saved as draft',
        variant: 'info',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const Spinner: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'spinner',
        message: 'Loading resource data...',
        autoDismiss: false,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const MultipleNotifications: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message: 'Resource saved successfully',
        variant: 'success',
        autoDismiss: true,
        timeout: 3000,
      },
      {
        id: '2',
        type: 'status',
        message: 'Failed to upload image',
        variant: 'danger',
        autoDismiss: true,
        timeout: 3000,
      },
      {
        id: '3',
        type: 'status',
        message: 'Some fields may need attention',
        variant: 'warning',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const MixedWithSpinner: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'spinner',
        message: 'Processing your request...',
        autoDismiss: false,
      },
      {
        id: '2',
        type: 'status',
        message: 'Previous operation completed',
        variant: 'info',
        autoDismiss: true,
        timeout: 3000,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

export const NonDismissible: Story = {
  decorators: [
    withNotifications([
      {
        id: '1',
        type: 'status',
        message:
          'This notificationnotificationnotificationnotificationnotificationnotificationnotification requires manual dismissal',
        variant: 'warning',
        autoDismiss: false,
      },
    ]),
  ],
  render: () => <NotificationBar />,
};

import { LoginPanel } from '@/components/auth/LoginPanel';
import { AuthContext } from '@/contexts/AuthContext';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const MockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mockAuth = {
    user: undefined,
    isAuthenticated: false,
    isAuthorized: false,
    isLoading: false,
    error: null,
    authService: {
      login: async () => Promise.resolve(),
      logout: () => {},
      getUser: async () => undefined,
      isAuthorized: () => false,
      getUserRoles: () => [],
      getUserFullName: () => 'Test User',
    },
  } as any;

  return (
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  );
};

const meta: Meta<typeof LoginPanel> = {
  title: 'Components/auth/LoginPanel',
  component: LoginPanel,
  decorators: [
    (Story: any) => (
      <MockProvider>
        <Story />
      </MockProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LoginPanel>;

export const Default: Story = {
  render: () => (
    <MockProvider>
      <LoginPanel onLogin={() => Promise.resolve()} />
    </MockProvider>
  ),
};

// export const Default: Story = {};

export const Mobile1: Story = {
  globals: {
    viewport: { value: 'mobile1' },
  },
};

export const Mobile2: Story = {
  globals: {
    viewport: { value: 'mobile2' },
  },
};

export const Tablet: Story = {
  globals: {
    viewport: { value: 'tablet' },
  },
};

export const Desktop: Story = {
  globals: {
    viewport: { value: 'desktop' },
  },
};

import { AuthContext } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/auth';
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

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  decorators: [
    (Story: any) => (
      <MockProvider>
        <Story />
      </MockProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

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

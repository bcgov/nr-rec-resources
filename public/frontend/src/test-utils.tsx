import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

afterEach(() => {
  cleanup();
});

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

export const TestQueryClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const testClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testClient}>{children}</QueryClientProvider>
  );
};

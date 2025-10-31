import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router';

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

/**
 * Renders component with TanStack Router and React Query context
 * Use this for components that use Link or other router hooks from @tanstack/react-router
 * Based on: https://dev.to/saltorgil/testing-tanstack-router-4io3
 */
export const renderWithRouter = async (
  ui: ReactNode,
  options?: { route?: string; path?: string; params?: Record<string, string> },
) => {
  const queryClient = createTestQueryClient();
  const routePath = options?.path || '$';
  const initialRoute = options?.route || '/';

  // Root route with QueryClient provider
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <div data-testid="root-layout">
          <Outlet />
        </div>
      </QueryClientProvider>
    ),
  });

  // Use a catch-all route to render any component
  // This avoids issues with typed routes in TanStack Router
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: routePath,
    component: () => <>{ui}</>,
  });

  // Create the router instance with memory history
  const router = createRouter({
    routeTree: rootRoute.addChildren([catchAllRoute]),
    history: createMemoryHistory({ initialEntries: [initialRoute] }),
    defaultPendingMinMs: 0,
  });

  // Render the router provider
  const renderResult = render(<RouterProvider router={router} />);

  // Wait for the route to resolve and the component to mount (with short timeout for fast failures)
  await screen.findByTestId('root-layout', {}, { timeout: 1000 });

  return renderResult;
};

export const renderWithQueryClient = (ui: ReactNode) => {
  const testClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testClient}>{ui}</QueryClientProvider>,
  );
};

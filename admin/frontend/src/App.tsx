import { AuthGuard } from '@/components';
import { AuthDebugPanel } from '@/components/AuthDebugPanel';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useGlobalQueryErrorHandler } from './services/hooks/useGlobalQueryErrorHandler';
import {
  parseRouterSearch,
  stringifyRouterSearch,
} from './utils/routerSearchParams';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollRestorationBehavior: 'instant',
  parseSearch: parseRouterSearch,
  stringifySearch: stringifyRouterSearch,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface RouterContext {
    queryClient: QueryClient;
  }
}

function App() {
  useGlobalQueryErrorHandler(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <RouterProvider router={router} />
        </AuthGuard>
        <AuthDebugPanel />
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

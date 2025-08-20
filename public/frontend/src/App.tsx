import ScrollToTop from './components/layout/ScrollToTop';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dataRouter } from '@/routes';
import './App.scss';

const MAIN_CONTENT_ID = 'main-content';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  return (
    <>
      <a
        className="visually-hidden-focusable skip-link"
        href={`#${MAIN_CONTENT_ID}`}
      >
        Skip to main content
      </a>

      <QueryClientProvider client={queryClient}>
        <RouterProvider router={dataRouter} />
      </QueryClientProvider>

      <ScrollToTop />
    </>
  );
};

export default App;

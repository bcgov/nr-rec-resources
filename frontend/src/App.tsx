import { AppRoutes } from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '~/@tanstack/react-query';

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
      <a className="visually-hidden-focusable" href={`#${MAIN_CONTENT_ID}`}>
        Skip to main content
      </a>
      <Header />
      <main>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <div id={MAIN_CONTENT_ID}>
              <AppRoutes />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </main>
      <Footer />
    </>
  );
};

export default App;

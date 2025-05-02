import { AppRoutes } from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ScrollToTop from './components/layout/ScrollToTop';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '~/@tanstack/react-query';

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
      <Header />
      <main>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </main>
      <ScrollToTop />
      <Footer />
    </>
  );
};

export default App;

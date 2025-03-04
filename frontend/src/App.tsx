import AppRoutes from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '~/@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
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
      <Footer />
    </>
  );
};

export default App;

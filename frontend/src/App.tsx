import AppRoutes from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <>
      <Header />
      <main className="page-padding">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </main>
      <Footer />
    </>
  );
};

export default App;

import AppRoutes from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <>
      <Header />
      <main
        // use bcparks bootstrap theme container class to share same page max width
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          flexGrow: 1,
          minHeight: '100%',
        }}
      >
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </main>
      <Footer />
    </>
  );
};

export default App;

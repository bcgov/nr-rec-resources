import '@/index.css';
import '@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css';
import '@bcgov/bc-sans/css/BC_Sans.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRoutes from '@/routes';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Header />
    <main
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
  </StrictMode>,
);

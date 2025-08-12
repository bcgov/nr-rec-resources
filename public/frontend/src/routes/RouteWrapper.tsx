import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { RouteChangeScrollReset } from '@/routes/RouteChangeScrollReset';
import { Outlet } from 'react-router';

// Layout component to wrap all route pages
export function RouteWrapper() {
  return (
    <>
      <Header />
      <main id="main-content">
        <RouteChangeScrollReset>
          <Outlet />
        </RouteChangeScrollReset>
      </main>
      <Footer />
    </>
  );
}

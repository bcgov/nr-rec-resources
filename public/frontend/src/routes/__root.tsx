import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';
import AlertBanner from '@/components/layout/AlertBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <AlertBanner />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

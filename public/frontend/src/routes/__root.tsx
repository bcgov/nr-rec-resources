import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';
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
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

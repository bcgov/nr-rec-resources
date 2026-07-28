import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, NotificationBar } from '@/components';
import { ViewOnlyBanner } from '@/components/auth';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useIsDesktop } from '@/hooks/useIsDesktop';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  // Render only the layout matching the current viewport rather than
  // mounting both and toggling visibility with CSS: with both mounted,
  // the route tree (including everything under <Outlet />) is mounted
  // twice simultaneously, which breaks components relying on a single
  // DOM identity, like the recreation resource map.
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="d-none d-md-flex flex-column vh-100 overflow-hidden bg-light">
        <Header />
        <ViewOnlyBanner />
        <NotificationBar />
        <div className="d-flex flex-grow-1 overflow-hidden">
          <Sidebar className="h-100" />
          <main id="main-content" className="flex-grow-1 p-4 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="d-block d-md-none">
      <Header />
      <ViewOnlyBanner />
      <NotificationBar />
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}

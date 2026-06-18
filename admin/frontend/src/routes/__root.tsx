import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, NotificationBar } from '@/components';
import { ViewOnlyBanner } from '@/components/auth';
import { Sidebar } from '@/components/sidebar/Sidebar';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/** Mobile version - No Sidebar */}
      <div className="d-block d-md-none">
        <Header />
        <ViewOnlyBanner />
        <NotificationBar />
        <main id="main-content">
          <Outlet />
        </main>
      </div>
      {/** Desktop version */}
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
    </>
  );
}

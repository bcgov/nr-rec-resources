import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, NotificationBar } from '@/components';
import { ViewOnlyBanner } from '@/components/auth';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header />
      <ViewOnlyBanner />
      <NotificationBar />
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}

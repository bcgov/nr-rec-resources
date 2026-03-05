import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, NotificationBar } from '@/components';
import { ViewOnlyBanner } from '@/components/auth';
import { FeatureFlagProvider } from '@/contexts/feature-flags';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <FeatureFlagProvider>
      <Header />
      <ViewOnlyBanner />
      <NotificationBar />
      <main id="main-content">
        <Outlet />
      </main>
    </FeatureFlagProvider>
  );
}

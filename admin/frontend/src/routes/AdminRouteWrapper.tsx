import { Header, NotificationBar } from '@/components';
import { Outlet } from 'react-router-dom';

/**
 * Admin route wrapper component that wraps all route pages with common layout elements
 * Similar to the public RouteWrapper but includes admin-specific components
 */
export function AdminRouteWrapper() {
  return (
    <>
      <Header />
      <NotificationBar />
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}

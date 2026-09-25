import { createFileRoute } from '@tanstack/react-router';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RequestsPage } from '@/pages/requests-page/RequestsPage';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/requests')({
  component: RequestsRoute,
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Requests',
        href: '/requests',
      },
    ],
  }),
});

function RequestsRoute() {
  return (
    <RoleRouteGuard
      requireAny={[ROLES.SUPER_ADMIN]}
      redirectTo={ROUTE_PATHS.LANDING}
    >
      <RequestsPage />
    </RoleRouteGuard>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { CreateNewPage } from '@/pages/create-new-page/CreateNewPage';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/create-new')({
  component: CreateNewRoute,
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Create new',
        href: '/create-new',
      },
    ],
  }),
});

function CreateNewRoute() {
  return (
    <RoleRouteGuard
      requireAny={[ROLES.SUPER_ADMIN]}
      redirectTo={ROUTE_PATHS.LANDING}
    >
      <CreateNewPage />
    </RoleRouteGuard>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourcePartnersLoader } from '@/services/loaders/recResourcePartnersLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';
import { RecResourcePartnersPage } from '@/pages/rec-resource-page/RecResourcePartnersPage';

export const Route = createFileRoute('/rec-resource/$id/partners/')({
  component: RecResourcePartnersPageRoute,
  loader: recResourcePartnersLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.PARTNERS,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Partners',
            href: `/rec-resource/${params.id}/partners`,
          },
        ];
      },
    };
  },
});

function RecResourcePartnersPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      // Roles from 973: matches the controller's @AuthRoles, which admits
      // RST_ADMIN and RST_SUPER_ADMIN but not RST_VIEWER.
      requireAny={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}
      // Must not be this route: RoleRouteGuard navigates here on failure, so
      // pointing at the guarded route itself loops.
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourcePartnersPage />
    </RoleRouteGuard>
  );
}

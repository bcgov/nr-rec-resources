import { createFileRoute } from '@tanstack/react-router';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourcePartnersEditPage } from '@/pages/rec-resource-page/RecResourcePartnersEditPage';
import { recResourcePartnersLoader } from '@/services/loaders/recResourcePartnersLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/partners/edit')({
  component: RecResourcePartnersEditRoute,
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
            label: 'Edit Partners',
            href: ROUTE_PATHS.REC_RESOURCE_PARTNERS_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourcePartnersEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      requireAny={[ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_PARTNERS.replace('$id', id)}
    >
      <RecResourcePartnersEditPage />
    </RoleRouteGuard>
  );
}

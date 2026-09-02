import { createFileRoute } from '@tanstack/react-router';
import { RecResourceAssetsPage } from '@/pages/rec-resource-page/RecResourceAssetsPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/assets/')({
  component: RecResourceAssetsPageRoute,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.ASSETS,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Assets',
            href: `/rec-resource/${params.id}/assets`,
          },
        ];
      },
    };
  },
});

function RecResourceAssetsPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      requireAny={[ROLES.IDIR_VIEWER, ROLES.VIEWER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourceAssetsPage />
    </RoleRouteGuard>
  );
}

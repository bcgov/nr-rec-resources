import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/fees/')({
  component: RecResourceFeesPageRoute,
  loader: recResourceFeesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.FEES,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Fees',
            href: `/rec-resource/${params.id}/fees`,
          },
        ];
      },
    };
  },
});

function RecResourceFeesPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAll={[ROLES.DEVELOPER]}
      requireAny={[ROLES.VIEWER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourceFeesPage />
    </RoleRouteGuard>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { RecResourceAdvisoriesPage } from '@/pages/rec-resource-page/RecResourceAdvisoriesPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceAdvisoriesLoader } from '@/services/loaders/recResourceAdvisoriesLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/advisories/')({
  component: RecResourceAdvisoriesPageRoute,
  loader: recResourceAdvisoriesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.ADVISORIES,
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Advisories and closures',
            href: `/rec-resource/${params.id}/advisories`,
          },
        ];
      },
    };
  },
});

function RecResourceAdvisoriesPageRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      requireAny={[ROLES.VIEWER, ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_FILES.replace('$id', id)}
    >
      <RecResourceAdvisoriesPage />
    </RoleRouteGuard>
  );
}

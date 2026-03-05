import { createFileRoute } from '@tanstack/react-router';
import { RecResourceOverviewEditSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/overview/edit')({
  component: RecResourceOverviewEditRoute,
  loader: recResourceLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.OVERVIEW,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Edit Overview',
            href: ROUTE_PATHS.REC_RESOURCE_OVERVIEW_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourceOverviewEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      require={[ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_OVERVIEW.replace('$id', id)}
    >
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <RecResourceOverviewEditSection />
      </FeatureFlagRouteGuard>
    </RoleRouteGuard>
  );
}

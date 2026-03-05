import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { RoleRouteGuard } from '@/components/auth';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceActivitiesFeaturesEditPage } from '@/pages/rec-resource-page/RecResourceActivitiesFeaturesEditPage';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceActivitiesFeaturesLoader } from '@/services/loaders/recResourceActivitiesFeaturesLoader';
import { ROLES } from '@/hooks/useAuthorizations';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute(
  '/rec-resource/$id/activities-features/edit',
)({
  component: RecResourceActivitiesFeaturesEditRoute,
  loader: recResourceActivitiesFeaturesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.ACTIVITIES,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Activities & features',
            href: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES.replace(
              '$id',
              params.id,
            ),
          },
          {
            label: 'Edit',
            href: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourceActivitiesFeaturesEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      require={[ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES.replace(
        '$id',
        id,
      )}
    >
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <RecResourceActivitiesFeaturesEditPage />
      </FeatureFlagRouteGuard>
    </RoleRouteGuard>
  );
}

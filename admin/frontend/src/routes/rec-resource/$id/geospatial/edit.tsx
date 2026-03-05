import { createFileRoute } from '@tanstack/react-router';
import { RecResourceGeospatialEditSection } from '@/pages/rec-resource-page/components/RecResourceGeospatialSection';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { recResourceGeospatialLoader } from '@/services/loaders/recResourceGeospatialLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { RoleRouteGuard } from '@/components/auth';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

export const Route = createFileRoute('/rec-resource/$id/geospatial/edit')({
  component: RecResourceGeospatialEditRoute,
  loader: recResourceGeospatialLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);

    return {
      tab: RecResourceNavKey.GEOSPATIAL,
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Edit Geospatial',
            href: ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL_EDIT.replace(
              '$id',
              params.id,
            ),
          },
        ];
      },
    };
  },
});

function RecResourceGeospatialEditRoute() {
  const { id } = Route.useParams();

  return (
    <RoleRouteGuard
      require={[ROLES.ADMIN]}
      redirectTo={ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL.replace('$id', id)}
    >
      <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
        <RecResourceGeospatialEditSection />
      </FeatureFlagRouteGuard>
    </RoleRouteGuard>
  );
}

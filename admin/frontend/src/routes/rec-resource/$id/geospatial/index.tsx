import { createFileRoute } from '@tanstack/react-router';
import { RecResourceGeospatialPage } from '@/pages/rec-resource-page/RecResourceGeospatialPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { recResourceGeospatialLoader } from '@/services/loaders/recResourceGeospatialLoader';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';

function RecResourceGeospatialPageRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceGeospatialPage />
    </FeatureFlagRouteGuard>
  );
}

export const Route = createFileRoute('/rec-resource/$id/geospatial/')({
  component: RecResourceGeospatialPageRoute,
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
            label: 'Geospatial',
            href: `/rec-resource/${params.id}/geospatial`,
          },
        ];
      },
    };
  },
});

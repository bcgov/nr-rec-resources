import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceActivitiesEditSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceActivitiesLoader } from '@/services/loaders/recResourceActivitiesLoader';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rec-resource/$id/activities/edit')({
  component: RecResourceActivitiesEditRoute,
  loader: recResourceActivitiesLoader,
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
            label: 'Activities',
            href: `/rec-resource/${params.id}/activities`,
          },
          {
            label: 'Edit Activities',
            href: `/rec-resource/${params.id}/activities/edit`,
          },
        ];
      },
    };
  },
});

function RecResourceActivitiesEditRoute() {
  return (
    <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
      <RecResourceActivitiesEditSection />
    </FeatureFlagRouteGuard>
  );
}

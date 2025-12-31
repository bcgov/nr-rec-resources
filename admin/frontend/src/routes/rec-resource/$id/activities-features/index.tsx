import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceActivitiesFeaturesPage } from '@/pages/rec-resource-page/RecResourceActivitiesFeaturesPage';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceActivitiesFeaturesLoader } from '@/services/loaders/recResourceActivitiesFeaturesLoader';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rec-resource/$id/activities-features/')({
  component: RecResourceActivitiesFeaturesRoute,
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
            href: `/rec-resource/${params.id}/activities-features`,
          },
        ];
      },
    };
  },
});

function RecResourceActivitiesFeaturesRoute() {
  return <RecResourceActivitiesFeaturesPage />;
}

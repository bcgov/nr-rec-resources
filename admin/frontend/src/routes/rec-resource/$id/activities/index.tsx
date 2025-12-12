import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceActivitiesPage } from '@/pages/rec-resource-page/RecResourceActivitiesPage';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceActivitiesLoader } from '@/services/loaders/recResourceActivitiesLoader';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rec-resource/$id/activities/')({
  component: RecResourceActivitiesRoute,
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
        ];
      },
    };
  },
});

function RecResourceActivitiesRoute() {
  return <RecResourceActivitiesPage />;
}

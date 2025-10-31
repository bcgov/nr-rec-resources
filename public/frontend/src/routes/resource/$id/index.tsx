import { createFileRoute } from '@tanstack/react-router';
import RecResourcePage from '@/components/rec-resource/RecResourcePage';
import { Route as ParentRoute } from '@/routes/resource/$id';
import { ROUTE_TITLES } from '@/constants/routes';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';

export const Route = createFileRoute('/resource/$id/')({
  component: RecResourceRoute,
  head: ({ loaderData }) => {
    const recResource = loaderData?.recResource;
    return {
      meta: [
        {
          title: ROUTE_TITLES.REC_RESOURCE(recResource?.name || ''),
        },
      ],
    };
  },
  loader: recResourceLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      breadcrumb: (loaderData?: any) => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        const breadcrumbs = parentBeforeLoad.breadcrumb(loaderData);
        // Mark last item as current for this route
        return breadcrumbs.map((item: BreadcrumbItem, index: number) =>
          index === breadcrumbs.length - 1
            ? { ...item, isCurrent: true }
            : item,
        );
      },
    };
  },
});

function RecResourceRoute() {
  return <RecResourcePage />;
}

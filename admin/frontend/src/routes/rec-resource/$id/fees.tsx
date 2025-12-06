import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceFeesPage } from '@/pages/rec-resource-page/RecResourceFeesPage';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rec-resource/$id/fees')({
  component: RecResourceFeesPage,
  loader: recResourceLoader,
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

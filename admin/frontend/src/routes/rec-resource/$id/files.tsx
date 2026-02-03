import { createFileRoute } from '@tanstack/react-router';
import { RecResourceFilesPage } from '@/pages/rec-resource-page/RecResourceFilesPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { recResourceFilesLoader } from '@/services/loaders/recResourceFilesLoader';

export const Route = createFileRoute('/rec-resource/$id/files')({
  component: RecResourceFilesRoute,
  loader: recResourceFilesLoader,
  beforeLoad: ({ params, context }) => {
    const parentBeforeLoad = ParentRoute.options.beforeLoad?.({
      params,
      context,
    } as any);
    return {
      tab: RecResourceNavKey.FILES,
      breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
        if (!parentBeforeLoad?.breadcrumb) return [];
        return [
          ...parentBeforeLoad.breadcrumb(loaderData),
          {
            label: 'Files',
            href: `/rec-resource/${params.id}/files`,
          },
        ];
      },
    };
  },
});

function RecResourceFilesRoute() {
  return <RecResourceFilesPage />;
}

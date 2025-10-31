import { createFileRoute, Outlet } from '@tanstack/react-router';
import NotFound from '@/components/NotFound';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';

export const Route = createFileRoute('/resource/$id')({
  component: ResourceLayout,
  loader: recResourceLoader,
  errorComponent: NotFound,
  beforeLoad: ({ params }) => ({
    breadcrumb: (loaderData?: any): BreadcrumbItem[] => {
      const lastSearch = sessionStorage.getItem('lastSearch');
      const resourceName = capitalizeWords(loaderData?.recResource?.name);
      const resourceId = params.id;

      return [
        {
          label: 'Home',
          href: '/',
        },
        {
          label: 'Find a site or trail',
          href: `/search${lastSearch || ''}`,
        },
        {
          label: resourceName || resourceId || 'Resource',
          href: `/resource/${resourceId}`,
        },
      ];
    },
  }),
});

function ResourceLayout() {
  return <Outlet />;
}

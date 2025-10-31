import { createFileRoute } from '@tanstack/react-router';
import NotFound from '@/components/NotFound';
import { ROUTE_PATHS, ROUTE_TITLES } from '@/constants/routes';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/$')({
  component: NotFoundRoute,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: '404 - Page Not Found',
      },
      { title: ROUTE_TITLES.NOT_FOUND },
    ],
  }),
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: ROUTE_PATHS.HOME,
      },
      {
        label: '404 - Page Not Found',
        isCurrent: true,
      },
    ],
  }),
});

function NotFoundRoute() {
  return <NotFound />;
}

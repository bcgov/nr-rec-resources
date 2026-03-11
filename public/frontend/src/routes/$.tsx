import { createFileRoute } from '@tanstack/react-router';
import NotFound from '@/components/NotFound';
import { ROUTE_PATHS, ROUTE_TITLES } from '@/constants/routes';
import { META_DESCRIPTIONS } from '@/constants/seo';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/$')({
  component: NotFoundRoute,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: META_DESCRIPTIONS.NOT_FOUND,
      },
      { title: ROUTE_TITLES.NOT_FOUND },
      { name: 'robots', content: 'noindex' },
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

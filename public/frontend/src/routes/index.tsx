import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';
import { ROUTE_PATHS, SITE_TITLE } from '@/constants/routes';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  component: HomeRoute,
  head: () => ({
    meta: [
      { name: 'description', content: 'Recreation Sites and Trails BC' },
      { title: SITE_TITLE },
    ],
  }),
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: ROUTE_PATHS.HOME,
        isCurrent: true,
      },
    ],
  }),
});

function HomeRoute() {
  return <LandingPage />;
}

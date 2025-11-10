import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/components/landing-page';
import { ROUTE_PATHS, SITE_TITLE } from '@/constants/routes';
import { META_DESCRIPTIONS } from '@/constants/seo';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  component: HomeRoute,
  head: () => {
    return {
      meta: [
        { name: 'description', content: META_DESCRIPTIONS.HOME },
        { title: SITE_TITLE },
      ],
    };
  },
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

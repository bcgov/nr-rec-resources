import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/pages/LandingPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  component: LandingRoute,
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: '/',
      },
    ],
  }),
});

function LandingRoute() {
  return <LandingPage />;
}

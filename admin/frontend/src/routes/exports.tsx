import { createFileRoute } from '@tanstack/react-router';
import { ExportsPage } from '@/pages/exports-page/ExportsPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/exports')({
  component: ExportsRoute,
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Data exports',
        href: '/exports',
      },
    ],
  }),
});

function ExportsRoute() {
  return <ExportsPage />;
}

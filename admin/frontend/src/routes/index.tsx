import { createFileRoute } from '@tanstack/react-router';
import { SearchPage } from '@/pages/search';
import { validateAdminSearch } from '@/pages/search/utils/searchSchema';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  validateSearch: validateAdminSearch,
  component: IndexRoute,
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => [
      {
        label: 'Home',
        href: '/',
      },
    ],
  }),
});

function IndexRoute() {
  return <SearchPage />;
}

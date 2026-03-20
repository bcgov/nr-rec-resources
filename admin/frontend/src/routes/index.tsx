import { createFileRoute } from '@tanstack/react-router';
import { SearchPage } from '@/pages/search';
import { validateAdminSearch } from '@/pages/search/utils/searchSchema';
import { adminSearchLoader } from '@/services/loaders/adminSearchLoader';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';

export const Route = createFileRoute('/')({
  validateSearch: validateAdminSearch,
  loaderDeps: ({ search }) => ({ search }),
  loader: adminSearchLoader,
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

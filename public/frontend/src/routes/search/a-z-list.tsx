import { createFileRoute } from '@tanstack/react-router';
import AlphabeticalListPage from '@/components/alphabetical-list/AlphabeticalListPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { ROUTE_TITLES } from '@/constants/routes';
import { alphabeticalLoader } from '@/service/loaders/alphabeticalLoader';

export type SearchParams = {
  letter?: string;
  type?: string;
};

export const Route = createFileRoute('/search/a-z-list')({
  component: AlphabeticalRoute,
  loader: alphabeticalLoader,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    letter: (search.letter as string) || '#',
    type: search.type as string | undefined,
  }),
  head: () => ({
    meta: [
      { name: 'description', content: 'A-Z list of recreation resources' },
      { title: ROUTE_TITLES.ALPHABETICAL },
    ],
  }),
  beforeLoad: () => ({
    breadcrumb: (): BreadcrumbItem[] => {
      const lastSearch = sessionStorage.getItem('lastSearch');
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
          label: 'A-Z list',
          href: '/search/a-z-list',
          isCurrent: true,
        },
      ];
    },
  }),
});

function AlphabeticalRoute() {
  return <AlphabeticalListPage />;
}

import { createFileRoute } from '@tanstack/react-router';
import SearchPage from '@/components/search/SearchPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { ROUTE_TITLES } from '@/constants/routes';
import { searchLoader } from '@/service/loaders/searchLoader';
import { META_DESCRIPTIONS } from '@/constants/seo';

export type SearchParams = {
  filter?: string;
  district?: string;
  activities?: string | number;
  access?: string;
  facilities?: string;
  status?: string;
  fees?: string;
  lat?: string;
  lon?: string;
  community?: string;
  type?: string;
  page?: number;
  view?: string;
  letter?: string;
};

export const Route = createFileRoute('/search/')({
  component: SearchRoute,
  loader: searchLoader,
  validateSearch: (search: Record<string | number, unknown>): SearchParams => {
    return {
      filter: search.filter as string | undefined,
      district: search.district as string | undefined,
      activities: search.activities as string | number | undefined,
      access: search.access as string | undefined,
      facilities: search.facilities as string | undefined,
      status: search.status as string | undefined,
      fees: search.fees as string | undefined,
      lat: search.lat as string | undefined,
      lon: search.lon as string | undefined,
      community: search.community as string | undefined,
      type: search.type as string | undefined,
      page: search.page as number | undefined,
      view: search.view as string | undefined,
      letter: search.letter as string | undefined,
    };
  },
  head: () => {
    return {
      meta: [
        { name: 'description', content: META_DESCRIPTIONS.SEARCH },
        { title: ROUTE_TITLES.SEARCH },
      ],
    };
  },
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
          isCurrent: true,
        },
      ];
    },
  }),
});

function SearchRoute() {
  return <SearchPage />;
}

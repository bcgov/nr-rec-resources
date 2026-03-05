import { createFileRoute } from '@tanstack/react-router';
import SearchPage from '@/components/search/SearchPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/constants/routes';
import { searchLoader } from '@/service/loaders/searchLoader';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl, buildOgMeta } from '@/utils/seo';

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
    const description = META_DESCRIPTIONS.SEARCH;
    const pageTitle = ROUTE_TITLES.SEARCH;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.SEARCH);
    const ogMeta = buildOgMeta({
      title: pageTitle,
      description,
      url: ogUrl,
      image: ogImage,
    });
    return {
      meta: [
        { name: 'description', content: description },
        { title: pageTitle },
        ...ogMeta,
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

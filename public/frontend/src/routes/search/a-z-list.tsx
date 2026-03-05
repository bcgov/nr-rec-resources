import { createFileRoute } from '@tanstack/react-router';
import AlphabeticalListPage from '@/components/alphabetical-list/AlphabeticalListPage';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { ROUTE_TITLES, ROUTE_PATHS } from '@/constants/routes';
import { alphabeticalLoader } from '@/service/loaders/alphabeticalLoader';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl, buildOgMeta } from '@/utils/seo';

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
    meta: (() => {
      const description = META_DESCRIPTIONS.ALPHABETICAL;
      const pageTitle = ROUTE_TITLES.ALPHABETICAL;
      const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
      const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.ALPHABETICAL);
      const ogMeta = buildOgMeta({
        title: pageTitle,
        description,
        url: ogUrl,
        image: ogImage,
      });
      return [
        { name: 'description', content: description },
        { title: pageTitle },
        ...ogMeta,
      ];
    })(),
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

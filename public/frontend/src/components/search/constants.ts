import { ROUTE_PATHS } from '@/constants/routes';

export interface SearchLink {
  label: string;
  path: string;
  search?: Record<string, string>;
  trackingName: string;
}

export const SEARCH_LINKS_TITLE = 'More ways to search';

export const SEARCH_LINKS: SearchLink[] = [
  {
    label: 'A-Z list',
    path: ROUTE_PATHS.ALPHABETICAL,
    trackingName: 'A-Z list',
  },
  {
    label: 'Map',
    path: ROUTE_PATHS.SEARCH,
    search: { view: 'map' },
    trackingName: 'Map',
  },
];

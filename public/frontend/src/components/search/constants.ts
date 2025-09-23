import { ROUTE_PATHS } from '@/routes/constants';

export interface SearchLink {
  label: string;
  path: string;
  search?: string;
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
    search: 'view=map',
    trackingName: 'Map',
  },
];

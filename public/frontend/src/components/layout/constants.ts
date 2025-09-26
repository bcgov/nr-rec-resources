import { EXTERNAL_LINKS } from '@/data/urls';

export interface HeaderLink {
  url: string;
  label: string;
  isExternal: boolean;
}

export const HEADER_LINKS: HeaderLink[] = [
  {
    url: '/search',
    label: 'Find a site or trail',
    isExternal: false,
  },
  {
    url: '/search?view=map',
    label: 'Search by map',
    isExternal: false,
  },
  {
    url: EXTERNAL_LINKS.LEGACY_SITE,
    label: 'Legacy site',
    isExternal: true,
  },
  {
    url: EXTERNAL_LINKS.ABOUT_RST,
    label: 'About Recreation Sites and Trails',
    isExternal: true,
  },
  {
    url: EXTERNAL_LINKS.ALERTS,
    label: 'Alerts',
    isExternal: true,
  },
];

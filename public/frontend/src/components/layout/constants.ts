import { EXTERNAL_LINKS } from '@/constants/urls';

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
    url: EXTERNAL_LINKS.ALERTS,
    label: 'Alerts',
    isExternal: true,
  },
  {
    url: EXTERNAL_LINKS.ABOUT_RST,
    label: 'About',
    isExternal: true,
  },
];

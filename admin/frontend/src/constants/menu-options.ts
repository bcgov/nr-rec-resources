import { buildActLoginUrl } from '@/utils/actUrls';
import { ROUTE_PATHS } from '@/constants/routes';

export const EXTERNAL_LINKS = {
  FTA: 'https://apps.nrs.gov.bc.ca/int/fta/',
  ADVISORIES_TOOL: buildActLoginUrl(import.meta.env.VITE_STAFF_ADMIN_URL),
  ONBOARDING:
    'https://apps.nrs.gov.bc.ca/int/confluence/display/BCPRS/RecSpace+Onboarding',
} as const;

export const menuLinks = [
  {
    url: ROUTE_PATHS.LANDING,
    text: 'Search',
    icon: '/images/sidebar/search-icon.svg',
    iconAlt: 'Search icon',
  },
  {
    url: ROUTE_PATHS.CREATE_NEW,
    text: 'Create new',
    icon: '/images/sidebar/create-new-icon.svg',
    iconAlt: 'Create new icon',
    superAdminOnly: true,
  },
  {
    url: ROUTE_PATHS.REQUESTS,
    text: 'Requests',
    icon: '/images/sidebar/requests-icon.svg',
    iconAlt: 'Requests icon',
    superAdminOnly: true,
  },
  {
    url: ROUTE_PATHS.EXPORTS,
    text: 'Export',
    icon: '/images/sidebar/export-icon.svg',
    iconAlt: 'Export icon',
  },
];

export const externalLinks = [
  {
    url: EXTERNAL_LINKS.ADVISORIES_TOOL,
    text: 'Advisories & closures',
    icon: '/images/sidebar/advisories-icon.svg',
    iconAlt: 'Advisories icon',
  },
  {
    url: EXTERNAL_LINKS.FTA,
    text: 'FTA',
    icon: '/images/sidebar/fta-icon.svg',
    iconAlt: 'FTA icon',
  },
  {
    url: EXTERNAL_LINKS.ONBOARDING,
    text: 'Onboarding',
    icon: '/images/sidebar/onboarding-icon.svg',
    iconAlt: 'Onboarding icon',
  },
];

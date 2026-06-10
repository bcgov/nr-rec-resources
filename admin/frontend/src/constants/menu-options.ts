export const EXTERNAL_LINKS = {
  FTA: 'https://apps.nrs.gov.bc.ca/int/fta/',
  ADVISORIES_TOOL: 'https://staff.bcparks.ca/advisories-and-closures?idp=idir',
  ONBOARDING:
    'https://apps.nrs.gov.bc.ca/int/confluence/display/BCPRS/RecSpace+Onboarding',
} as const;

export const menuLinks = [
  {
    url: '/',
    text: 'Search',
    icon: '/images/sidebar/search-icon.svg',
    iconAlt: 'Search Icon',
  },
];

export const externalLinks = [
  {
    url: EXTERNAL_LINKS.ADVISORIES_TOOL,
    text: 'Advisories & Closures',
    icon: '/images/sidebar/advisories-icon.svg',
    iconAlt: 'Advisories Icon',
  },
  {
    url: EXTERNAL_LINKS.FTA,
    text: 'FTA',
    icon: '/images/sidebar/fta-icon.svg',
    iconAlt: 'FTA Icon',
  },
  {
    url: EXTERNAL_LINKS.ONBOARDING,
    text: 'Onboarding',
    icon: '/images/sidebar/onboarding-icon.svg',
    iconAlt: 'Onboarding Icon',
  },
];

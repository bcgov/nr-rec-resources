export const ROUTE_PATHS = {
  HOME: '/',
  SEARCH: '/search',
  ALPHABETICAL: '/search/a-z-list',
  REC_RESOURCE: '/resource/:id',
  NOT_FOUND: '*',
  CONTACT_US: '/contact',
  REC_RESOURCE_CONTACT: '/resource/:id/contact',
};

export const SITE_TITLE = 'Sites and Trails BC';

export const ROUTE_TITLES = {
  HOME: SITE_TITLE,
  SEARCH: `Find a site or trail | ${SITE_TITLE}`,
  ALPHABETICAL: `A-Z list | ${SITE_TITLE}`,
  REC_RESOURCE: (name: string) => `${name} | ${SITE_TITLE}`,
  NOT_FOUND: `404 | ${SITE_TITLE}`,
  CONTACT: `Contact Us | ${SITE_TITLE}`,
  REC_RESOURCE_CONTACT: (name?: string): string => {
    const titleSegment = name ? ` - ${name}` : '';
    return `Contact Us${titleSegment} | ${SITE_TITLE}`;
  },
};

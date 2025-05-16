export const ROUTE_PATHS = {
  HOME: '/',
  SEARCH: '/search',
  REC_RESOURCE: '/resource/:id',
  NOT_FOUND: '*',
};

export const SITE_TITLE = 'Sites and trails BC';

export const ROUTE_TITLES = {
  HOME: SITE_TITLE,
  SEARCH: `Find a site or trail | ${SITE_TITLE}`,
  REC_RESOURCE: (name: string) => `${name} | ${SITE_TITLE}`,
  NOT_FOUND: `404 | ${SITE_TITLE}`,
};

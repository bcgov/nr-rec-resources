export enum RecResourceNavKey {
  OVERVIEW = "overview",
  FILES = "files",
}

/**
 * Navigation configuration for recreation resource pages.
 *
 * This configuration defines the navigation structure including titles
 * and route generation functions for each tab section.
 */
export const REC_RESOURCE_PAGE_NAV_SECTIONS = {
  [RecResourceNavKey.OVERVIEW]: {
    title: "Overview",
    route: (id: string) => `/rec-resource/${id}`,
  },
  [RecResourceNavKey.FILES]: {
    title: "Files",
    route: (id: string) => `/rec-resource/${id}/files`,
  },
};

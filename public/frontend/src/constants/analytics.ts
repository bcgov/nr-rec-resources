// Categories
export const MATOMO_CATEGORY_SEARCH = 'Search';
export const MATOMO_CATEGORY_LOADMORE = 'Loadmore';
export const MATOMO_CATEGORY_FILTERS = 'Filters';
export const MATOMO_CATEGORY_MAP_VIEW = 'MapView';
export const MATOMO_CATEGORY_LIST_VIEW = 'ListView';
export const MATOMO_CATEGORY_EXPORT_MAP = 'Export map';
export const MATOMO_CATEGORY_PDF_VIEWED = 'PDF_viewed';
export const MATOMO_CATEGORY_CARD_IMAGE_CAROUSEL = 'Card image carousel';
export const MATOMO_CATEGORY_PHOTO_GALLERY = 'Photo gallery';
export const MATOMO_CATEGORY_FOOTER_LINK = 'Footer link';
export const MATOMO_CATEGORY_SECTION_MENU_NAV = 'Section menu navigation';
export const MATOMO_CATEGORY_FEEDBACK = 'Feedback';
export const MATOMO_CATEGORY_LEARN_MORE = 'Learn More';
export const MATOMO_TRACKING_CATEGORY_CONTACT_PAGE = 'ContactPage';

// Common actions
export const MATOMO_ACTION_CLICK = 'Click';

// Search actions
export const MATOMO_ACTION_SEARCH_HOME_ENTER = 'Search_home_enter';
export const MATOMO_ACTION_SEARCH_HOME_SELECTED = 'Search_home_selected';
export const MATOMO_ACTION_SEARCH_LIST_ENTER = 'Search_list_enter';
export const MATOMO_ACTION_SEARCH_LIST_SELECTED = 'Search_list_selected';
export const MATOMO_ACTION_SEARCH_MAP_ENTER = 'Search_map_enter';
export const MATOMO_ACTION_SEARCH_MAP_SELECTED = 'Search_map_selected';

// Search contexts (internal selectors for picking which Search_* action to use)
export const MATOMO_SEARCH_CONTEXT_HOME = 'Search_home';
export const MATOMO_SEARCH_CONTEXT_LIST = 'Search_list';
export const MATOMO_SEARCH_CONTEXT_MAP = 'Search_map';

export type MatomoSearchContext =
  | typeof MATOMO_SEARCH_CONTEXT_HOME
  | typeof MATOMO_SEARCH_CONTEXT_LIST
  | typeof MATOMO_SEARCH_CONTEXT_MAP;

export type MatomoSearchKind = 'enter' | 'selected';

export const MATOMO_SEARCH_ACTION_BY_SOURCE: Record<
  MatomoSearchContext,
  Record<MatomoSearchKind, string>
> = {
  [MATOMO_SEARCH_CONTEXT_HOME]: {
    enter: MATOMO_ACTION_SEARCH_HOME_ENTER,
    selected: MATOMO_ACTION_SEARCH_HOME_SELECTED,
  },
  [MATOMO_SEARCH_CONTEXT_LIST]: {
    enter: MATOMO_ACTION_SEARCH_LIST_ENTER,
    selected: MATOMO_ACTION_SEARCH_LIST_SELECTED,
  },
  [MATOMO_SEARCH_CONTEXT_MAP]: {
    enter: MATOMO_ACTION_SEARCH_MAP_ENTER,
    selected: MATOMO_ACTION_SEARCH_MAP_SELECTED,
  },
};

// Load more
export const MATOMO_ACTION_LOADMORE = 'Loadmore';

// Filters
export const MATOMO_ACTION_FILTERS_LIST_DESKTOP = 'Filters_list_desktop';
export const MATOMO_ACTION_FILTERS_LIST_MOBILE = 'Filters_list_mobile';
export const MATOMO_ACTION_FILTERS_MAP = 'Filters_map';

// View toggles
export const MATOMO_ACTION_MAPVIEW_HOME = 'MapView_home';
export const MATOMO_NAME_MAPVIEW_HOME = 'MapView_home';
export const MATOMO_ACTION_MAPVIEW_LIST = 'MapView_list';
export const MATOMO_NAME_MAPVIEW_LIST = 'MapView_list';
export const MATOMO_ACTION_LISTVIEW_MAP = 'ListView_map';
export const MATOMO_NAME_LISTVIEW_MAP = 'ListView_map';
export const MATOMO_ACTION_MAPVIEW_RESOURCE = 'MapView_resource';
export const MATOMO_NAME_MAPVIEW_RESOURCE = 'MapView_resource';

// Export bulk download (search pages)
export const MATOMO_ACTION_EXPORT_FILTERED_RESULTS = 'Export filtered results';

// Export map (resource page downloads)
export const MATOMO_ACTION_EXPORT_MAP_GPX = 'Export map_GPX';
export const MATOMO_ACTION_EXPORT_MAP_KML = 'Export map_KML';

// Photo gallery
export const MATOMO_NAME_PHOTO_GALLERY_OPEN = 'Open photo gallery';

// Contact page
export const MATOMO_ACTION_CONTACT_EMAIL_LINK_CLICK = 'Email link click';
export const MATOMO_NAME_CONTACT_EMAIL_RECINFO = 'recinfo@gov.bc.ca';
export const MATOMO_ACTION_CONTACT_FROM_REC_RESOURCE_CLICK =
  'Click (from rec resource)';
export const MATOMO_ACTION_CONTACT_PAGE_LOAD = 'ContactPage - Page load';
export const MATOMO_ACTION_CONTACT_DROPDOWN_SELECTION =
  'ContactPage - Dropdown selection';
export const MATOMO_NAME_PREFIX_CONTACT_DROPDOWN_SELECTION =
  'Dropdown Selection - ';

// Navigation
export const MATOMO_NAME_FEEDBACK_BETA_BANNER_BUTTON =
  'Beta banner feedback button';

import { PageSection } from '@/components/layout/PageWithScrollMenu';

// Shorter, more manageable contact topic identifiers
export const CONTACT_TOPICS = {
  RESERVATIONS: 'reservations',
  SITE_OR_TRAIL: 'site-trail',
  CANNOT_FIND: 'cannot-find',
  WILDFIRES: 'wildfires',
  RAPP: 'rapp',
  NATURAL_RESOURCE_VIOLATION: 'resource-violation',
} as const;

// Display labels for dropdown options
export const CONTACT_TOPIC_LABELS = {
  [CONTACT_TOPICS.RESERVATIONS]: 'Reservations, fees, and discounts',
  [CONTACT_TOPICS.SITE_OR_TRAIL]: 'Site or Trail',
  [CONTACT_TOPICS.CANNOT_FIND]: "I cannot find what I'm looking for",
  [CONTACT_TOPICS.WILDFIRES]: 'Wildfires and Campfire Bans',
  [CONTACT_TOPICS.RAPP]: 'Report All Poachers and Polluters',
  [CONTACT_TOPICS.NATURAL_RESOURCE_VIOLATION]:
    'Report a Natural Resource Violation',
} as const;

export const CONTACT_PAGE_POPULAR_TOPIC_LINKS = [
  {
    text: 'Reservations, fees, and discounts',
    url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees',
  },
  {
    text: 'Rules and etiquette',
    url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/rules',
  },
  {
    text: 'Campfires',
    url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions',
  },
  {
    text: 'Planning your trip',
    url: 'https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning',
  },
] as const;

// Page sections configuration
export const CONTACT_PAGE_PAGE_SECTIONS: PageSection[] = [
  {
    id: 'popular-inquiries',
    href: '#popular-inquiries',
    title: 'Popular inquiries',
    isVisible: true,
  },
  {
    id: 'contact-us',
    href: '#contact-us',
    title: 'Contact us',
    isVisible: true,
  },
];

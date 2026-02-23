export const SITE_METADATA = {
  title: 'Sites and Trails BC',
  description:
    'Discover and explore recreation sites and trails across British Columbia.',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  locale: 'en_CA',
  type: 'website',
};

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_DEFAULT_IMAGE_PATH = '/images/og-preview.png';

export const META_DESCRIPTIONS = {
  HOME: 'Official website for Recreation Sites and Trails BC. Get information on public recreation opportunities across British Columbia.',
  SEARCH:
    'Search for recreation sites, trails and interpretive forests throughout British Columbia. Get detailed information about recreation opportunities.',
  ALPHABETICAL:
    'Browse recreation sites, trails and interpretive forests alphabetically.',
  REC_RESOURCE_CONTACT: 'Get in touch with Recreation Sites and Trails BC',
  NOT_FOUND: 'The page you are looking for does not exist.',
  CONTACT:
    'Find out how to get help on various topics, report a violation and get in touch with Recreation Sites and Trails BC by email.',
};

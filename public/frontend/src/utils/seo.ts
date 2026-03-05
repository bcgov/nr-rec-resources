import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_METADATA,
} from '@/constants/seo';

type OgMetaOptions = {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  siteName?: string;
  locale?: string;
};

export const buildAbsoluteUrl = (pathOrUrl?: string): string => {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  if (!SITE_METADATA.url) return pathOrUrl;
  return `${SITE_METADATA.url}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

export const buildOgMeta = ({
  title,
  description,
  url,
  image,
  imageAlt = 'Recreation Sites and Trails BC logo',
  imageWidth = OG_IMAGE_WIDTH,
  imageHeight = OG_IMAGE_HEIGHT,
  siteName = SITE_METADATA.title,
  locale = SITE_METADATA.locale,
}: OgMetaOptions) => [
  { property: 'og:title', content: title },
  { property: 'og:description', content: description },
  { property: 'og:site_name', content: siteName },
  { property: 'og:locale', content: locale },
  { property: 'og:url', content: url },
  { property: 'og:image', content: image },
  { property: 'og:image:width', content: `${imageWidth}` },
  { property: 'og:image:height', content: `${imageHeight}` },
  { property: 'og:image:alt', content: imageAlt },
];

export const getResourceMetaDescription = (
  description?: string,
  name?: string,
): string => {
  if (description) {
    // Truncate description if too long (ideal length is 150-160 characters)
    const maxLength = 155;
    if (description.length > maxLength) {
      return description.substring(0, maxLength - 3) + '...';
    }
    return description;
  }

  return `Details information about ${name}.`;
};

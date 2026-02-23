import { Route } from '@/routes/contact';
import { ROUTE_PATHS, ROUTE_TITLES } from '@/constants/routes';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl } from '@/utils/seo';
import { describe, expect, it } from 'vitest';

describe('Contact Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have head function', () => {
    expect(Route.options.head).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should generate correct breadcrumbs', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const result = beforeLoad();

    expect(result.breadcrumb).toBeDefined();

    const breadcrumb = result.breadcrumb();

    expect(breadcrumb).toHaveLength(2);
    expect(breadcrumb[0]).toEqual({
      label: 'Home',
      href: '/',
    });
    expect(breadcrumb[1]).toEqual({
      label: 'Contact',
      href: '/contact',
      isCurrent: true,
    });
  });
  it('should return correct OpenGraph head metadata', () => {
    const headResult = Route.options.head!({} as any);

    const description = META_DESCRIPTIONS.CONTACT;
    const pageTitle = ROUTE_TITLES.CONTACT;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.CONTACT_US);

    expect(headResult).toEqual({
      meta: expect.arrayContaining([
        { name: 'description', content: description },
        { title: pageTitle },
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: description },
        { property: 'og:url', content: ogUrl },
        { property: 'og:image', content: ogImage },
      ]),
    });
  });
});

import { Route } from '@/routes/index';
import { ROUTE_PATHS, SITE_TITLE } from '@/constants/routes';
import { META_DESCRIPTIONS, OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { buildAbsoluteUrl } from '@/utils/seo';
import { describe, expect, it } from 'vitest';

describe('Home Route', () => {
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

  it('should generate correct breadcrumb', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const result = beforeLoad();

    expect(result.breadcrumb).toBeDefined();

    const breadcrumb = result.breadcrumb();

    expect(breadcrumb).toHaveLength(1);
    expect(breadcrumb[0]).toEqual({
      label: 'Home',
      href: '/',
      isCurrent: true,
    });
  });
  it('should return correct OpenGraph head metadata', () => {
    const headResult = Route.options.head!({} as any);

    const description = META_DESCRIPTIONS.HOME;
    const pageTitle = SITE_TITLE;
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(ROUTE_PATHS.HOME);

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

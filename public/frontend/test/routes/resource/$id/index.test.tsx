import { Route } from '@/routes/resource/$id/index';
import { ROUTE_TITLES } from '@/constants/routes';
import { buildAbsoluteUrl, getResourceMetaDescription } from '@/utils/seo';
import { OG_DEFAULT_IMAGE_PATH } from '@/constants/seo';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { describe, expect, it } from 'vitest';

describe('Resource Detail Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceLoader', () => {
    expect(Route.options.loader).toBe(recResourceLoader);
  });

  it('should have head function', () => {
    expect(Route.options.head).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should generate correct head metadata with resource name', () => {
    const head = Route.options.head as any;
    const loaderData = {
      recResource: { name: 'Test Resource' },
    };

    const result = head({ loaderData });

    expect(result.meta).toBeDefined();
    expect(result.meta.length).toBeGreaterThan(0);
  });

  it('should mark last breadcrumb item as current', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.breadcrumb).toBeDefined();

    const loaderData = {
      recResource: { name: 'Test Resource' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb.length).toBeGreaterThan(0);
    expect(breadcrumb[breadcrumb.length - 1].isCurrent).toBe(true);
  });
  it('should return correct OpenGraph head metadata', () => {
    const headResult = Route.options.head!({
      params: { id: '123' },
      loaderData: { recResource: { name: 'Test Resource' } },
    } as any);

    const description = getResourceMetaDescription(undefined, 'Test Resource');
    const pageTitle = ROUTE_TITLES.REC_RESOURCE('Test Resource');
    const ogImage = buildAbsoluteUrl(OG_DEFAULT_IMAGE_PATH);
    const ogUrl = buildAbsoluteUrl(`/resource/123`);

    expect(headResult).toEqual({
      meta: expect.arrayContaining([
        { name: 'description', content: description },
        { title: pageTitle },
        { property: 'og:title', content: pageTitle },
        { property: 'og:description', content: description },
        { property: 'og:url', content: ogUrl },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:alt', content: 'Test Resource photo' },
      ]),
    });
  });
});

import { Route } from '@/routes/rec-resource/$id';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';

describe('RecResource $id Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceLoader', () => {
    expect(Route.options.loader).toBe(recResourceLoader);
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should set tab to FILES in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };

    const result = beforeLoad({ params });

    expect(result.tab).toBe(RecResourceNavKey.FILES);
  });

  it('should generate breadcrumb with resource name', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };

    const result = beforeLoad({ params });
    const loaderData = {
      recResource: { name: 'test resource name' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(2);
    expect(breadcrumb[0]).toEqual({
      label: 'Home',
      href: '/',
    });
    expect(breadcrumb[1]).toEqual({
      label: 'Test Resource Name',
      href: '/rec-resource/REC123',
    });
  });

  it('should generate breadcrumbs', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };

    const result = beforeLoad({ params });
    const loaderData = { recResource: { name: '' } };
    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(2);
    expect(breadcrumb[1]).toEqual({
      label: 'Resource Details',
      href: '/rec-resource/REC123',
    });
  });
});

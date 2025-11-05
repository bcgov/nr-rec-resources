import { Route } from '@/routes/resource/$id/contact';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { describe, expect, it } from 'vitest';

describe('Resource Contact Route', () => {
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

  it('should generate breadcrumb with contact item', () => {
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
    const lastItem = breadcrumb[breadcrumb.length - 1];
    expect(lastItem.label).toBe('Contact');
    expect(lastItem.isCurrent).toBe(true);
  });
});

import { Route } from '@/routes/resource/$id';
import { recResourceLoader } from '@/service/loaders/recResourceLoader';
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('Resource $id Route', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceLoader', () => {
    expect(Route.options.loader).toBe(recResourceLoader);
  });

  it('should have errorComponent defined', () => {
    expect(Route.options.errorComponent).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should generate breadcrumb with resource name', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };

    const result = beforeLoad({ params });
    const loaderData = {
      recResource: { name: 'test resource name' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(3);
    expect(breadcrumb[0]).toEqual({
      label: 'Home',
      href: '/',
    });
    expect(breadcrumb[1]).toEqual({
      label: 'Find a site or trail',
      href: '/search',
    });
    expect(breadcrumb[2]).toEqual({
      label: 'Test Resource Name',
      href: '/resource/REC123',
    });
  });

  it('should generate breadcrumb with resource id when name is empty', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC456' };

    const result = beforeLoad({ params });
    const loaderData = { recResource: { name: '' } };
    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(3);
    expect(breadcrumb[2]).toEqual({
      label: 'REC456',
      href: '/resource/REC456',
    });
  });

  it('should use lastSearch from sessionStorage in breadcrumb', () => {
    const mockGetItem = vi.fn().mockReturnValue('?filter=test');
    vi.stubGlobal('sessionStorage', {
      getItem: mockGetItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };

    const result = beforeLoad({ params });
    const loaderData = { recResource: { name: 'Test' } };
    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb[1].href).toBe('/search?filter=test');
  });
});

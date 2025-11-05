import { Route } from '@/routes/search/index';
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('Search Route', () => {
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

  it('should have loader function', () => {
    expect(Route.options.loader).toBeDefined();
  });

  it('should have head function', () => {
    expect(Route.options.head).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should have validateSearch function', () => {
    expect(Route.options.validateSearch).toBeDefined();
  });

  it('should validate search params correctly', () => {
    const validateSearch = Route.options.validateSearch as any;
    const search = {
      filter: 'test',
      district: '123',
      activities: 5,
      page: 2,
      view: 'map',
    };

    const result = validateSearch(search);

    expect(result).toEqual({
      filter: 'test',
      district: '123',
      activities: 5,
      access: undefined,
      facilities: undefined,
      status: undefined,
      fees: undefined,
      lat: undefined,
      lon: undefined,
      community: undefined,
      type: undefined,
      page: 2,
      view: 'map',
      letter: undefined,
    });
  });

  it('should generate correct breadcrumb', () => {
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
      label: 'Find a site or trail',
      href: '/search',
      isCurrent: true,
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
    const result = beforeLoad();
    const breadcrumb = result.breadcrumb();

    expect(breadcrumb[1].href).toBe('/search?filter=test');
  });
});

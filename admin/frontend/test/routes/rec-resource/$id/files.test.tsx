import { Route } from '@/routes/rec-resource/$id/files';
import { recResourceFilesLoader } from '@/services/loaders/recResourceFilesLoader';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';

describe('RecResource Files Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceFilesLoader', () => {
    expect(Route.options.loader).toBe(recResourceFilesLoader);
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should set tab to FILES in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.FILES);
  });

  it('should generate breadcrumb', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });
    const loaderData = {
      recResource: { name: 'test resource' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(3);
    expect(breadcrumb[0].label).toBe('Home');
    expect(breadcrumb[1].label).toBe('Test Resource');
    expect(breadcrumb[2]).toEqual({
      label: 'Files',
      href: '/rec-resource/REC123/files',
    });
  });
});

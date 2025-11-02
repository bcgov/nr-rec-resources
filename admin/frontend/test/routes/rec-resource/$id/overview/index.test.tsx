import { Route } from '@/routes/rec-resource/$id/overview/index';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';

describe('RecResource Overview Route', () => {
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

  it('should set tab to OVERVIEW in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    const result = beforeLoad();

    expect(result.tab).toBe(RecResourceNavKey.OVERVIEW);
  });
});

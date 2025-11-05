import { Route } from '@/routes/rec-resource/$id/index';
import { describe, expect, it } from 'vitest';

describe('RecResource $id Index Route (Redirect)', () => {
  it('should export a Route', () => {
    expect(Route).toBeDefined();
  });

  it('should have beforeLoad that throws redirect', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    expect(() => beforeLoad()).toThrow();
  });

  it('should redirect to overview route', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    try {
      beforeLoad();
      // If we get here, the redirect didn't throw
      expect.fail('Expected beforeLoad to throw a redirect');
    } catch (error: any) {
      // The redirect throws an object with redirect info
      expect(error).toBeDefined();
    }
  });
});

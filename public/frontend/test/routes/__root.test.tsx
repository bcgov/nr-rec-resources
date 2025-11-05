import { Route } from '@/routes/__root';
import { describe, expect, it } from 'vitest';

describe('Root Route', () => {
  it('should export a Route with a component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should be a root route', () => {
    expect(Route).toBeDefined();
    expect(typeof Route.options.component).toBe('function');
  });
});

import { clsConfig } from '@/common/cls.config';

describe('clsConfig', () => {
  it('should be global and have middleware with correct options', () => {
    expect(clsConfig.global).toBe(true);
    expect(clsConfig.middleware).toBeDefined();
    if (clsConfig.middleware) {
      expect(clsConfig.middleware.mount).toBe(true);
      expect(clsConfig.middleware.generateId).toBe(true);
      expect(typeof clsConfig.middleware.idGenerator).toBe('function');
      expect(typeof clsConfig.middleware.setup).toBe('function');
    }
  });

  it('should generate a valid uuid for idGenerator', () => {
    if (clsConfig.middleware && clsConfig.middleware.idGenerator) {
      // idGenerator expects one argument (req), but our config ignores it
      const id = clsConfig.middleware.idGenerator(undefined);
      // UUID v4 regex
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
  });

  it('should set requestMethod, requestUrl, and userAgent in setup', () => {
    if (clsConfig.middleware && clsConfig.middleware.setup) {
      const cls = {
        set: vi.fn(),
      };
      const req = {
        method: 'POST',
        url: '/api/test',
        headers: { 'user-agent': 'jest-agent' },
      };
      // setup expects (cls, req, res)
      clsConfig.middleware.setup(cls as any, req, undefined);
      expect(cls.set).toHaveBeenCalledWith('requestMethod', 'POST');
      expect(cls.set).toHaveBeenCalledWith('requestUrl', '/api/test');
      expect(cls.set).toHaveBeenCalledWith('userAgent', 'jest-agent');
    }
  });
});

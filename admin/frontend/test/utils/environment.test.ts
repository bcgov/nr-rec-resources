import { isProd } from '@/utils/environment';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isProd', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['dev', 'development', 'test'])(
    'is false for the %s deployment environment',
    (env) => {
      vi.stubEnv('VITE_DEPLOYMENT_ENV', env);
      expect(isProd()).toBe(false);
    },
  );

  it('is true for the prod deployment environment', () => {
    vi.stubEnv('VITE_DEPLOYMENT_ENV', 'prod');
    expect(isProd()).toBe(true);
  });

  // Unknown values have to land on prod, otherwise we leak pre-release UI.
  it.each(['production', 'prd', 'staging', 'DEV', ''])(
    'treats the unrecognised value %j as production',
    (env) => {
      vi.stubEnv('VITE_DEPLOYMENT_ENV', env);
      // Empty string falls through to MODE, which is 'test' here.
      expect(isProd()).toBe(env !== '');
    },
  );

  it('falls back to Vite MODE when the deployment env is unset', () => {
    vi.stubEnv('VITE_DEPLOYMENT_ENV', undefined as unknown as string);
    expect(isProd()).toBe(false);
  });
});

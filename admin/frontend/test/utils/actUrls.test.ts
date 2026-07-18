import { describe, expect, it } from 'vitest';
import { buildActLoginUrl, buildActUrl } from '@/utils/actUrls';

describe('actUrls', () => {
  it('preserves an existing base query and appends a path', () => {
    expect(
      buildActLoginUrl(
        'https://alpha-test-staff.bcparks.ca?idp=idir',
        'public-advisories',
      ),
    ).toBe('https://alpha-test-staff.bcparks.ca/public-advisories?idp=idir');
  });

  it('appends nested advisory links without duplicating the query', () => {
    expect(
      buildActLoginUrl(
        'https://alpha-test-staff.bcparks.ca?idp=idir',
        'advisory-link/3189',
      ),
    ).toBe('https://alpha-test-staff.bcparks.ca/advisory-link/3189?idp=idir');
  });

  it('supports additional query parameters when provided', () => {
    expect(
      buildActUrl(
        'https://alpha-test-staff.bcparks.ca?idp=idir',
        'public-advisories',
        { foo: 'bar' },
      ),
    ).toBe(
      'https://alpha-test-staff.bcparks.ca/public-advisories?idp=idir&foo=bar',
    );
  });

  it('returns a relative URL when no base url is available', () => {
    expect(buildActLoginUrl('', 'public-advisories')).toBe(
      '/public-advisories?idp=idir',
    );
  });
});

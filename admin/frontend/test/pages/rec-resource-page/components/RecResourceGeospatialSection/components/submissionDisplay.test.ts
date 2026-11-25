import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSncscSubmissionUrl,
  formatSubmissionDate,
  getPurposeDisplay,
  getStatusDisplay,
} from '@/pages/rec-resource-page/components/RecResourceGeospatialSection/components/submissionDisplay';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('submissionDisplay helpers', () => {
  it('maps purpose codes to expected labels', () => {
    expect(getPurposeDisplay('N').label).toBe('NEW');
    expect(getPurposeDisplay('a').label).toBe('AMEND');
    expect(getPurposeDisplay('R').label).toBe('RETIRE');
    expect(getPurposeDisplay(undefined).label).toBe('-');
  });

  it('maps status codes to normalized labels', () => {
    expect(getStatusDisplay('PND').label).toBe('PENDING');
    expect(getStatusDisplay('rejected_retire').label).toBe('REJECTED');
    expect(getStatusDisplay('RET').label).toBe('RETIRED');
    expect(getStatusDisplay('approved_new').label).toBe('APPROVED');
    expect(getStatusDisplay(null).label).toBe('-');
  });

  it('formats valid submission dates and handles invalid dates', () => {
    expect(formatSubmissionDate('2026-11-16T12:00:00.000Z')).toBe('2026-11-16');
    expect(formatSubmissionDate('not-a-date')).toBe('-');
    expect(formatSubmissionDate()).toBe('-');
  });

  it('builds SNCSC URL from env var and trims trailing slashes', () => {
    vi.stubEnv('VITE_SNCSC_WEB_URL', 'https://example.gov.bc.ca/sncsc///');

    expect(buildSncscSubmissionUrl('guid-123')).toBe(
      'https://example.gov.bc.ca/sncsc/guid-123',
    );
  });

  it('returns null when SNCSC base url or request guid is missing', () => {
    vi.stubEnv('VITE_SNCSC_WEB_URL', '');
    vi.stubEnv('SNCSC_WEB_URL', '');

    expect(buildSncscSubmissionUrl('guid-123')).toBeNull();
    expect(buildSncscSubmissionUrl(undefined)).toBeNull();
  });
});

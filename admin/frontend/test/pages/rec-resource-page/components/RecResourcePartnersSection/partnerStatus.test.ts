import { describe, it, expect } from 'vitest';
import {
  formatAgreementDate,
  getAgreementStatusBadge,
  isAgreementExpired,
} from '@/pages/rec-resource-page/components/RecResourcePartnersSection/partnerStatus';

const NOW = new Date('2026-09-15T00:00:00Z');

describe('isAgreementExpired', () => {
  it('treats a missing end date as active, not expired', () => {
    // An open-ended agreement has no end date; it must not read as Expired.
    expect(isAgreementExpired(undefined, NOW)).toBe(false);
    expect(isAgreementExpired(null, NOW)).toBe(false);
    expect(isAgreementExpired('', NOW)).toBe(false);
  });

  it('is expired when the end date has passed', () => {
    expect(isAgreementExpired('2026-09-14', NOW)).toBe(true);
    expect(isAgreementExpired('2020-01-01', NOW)).toBe(true);
  });

  it('is active when the end date is still in the future', () => {
    expect(isAgreementExpired('2026-09-16', NOW)).toBe(false);
    expect(isAgreementExpired('2030-12-31', NOW)).toBe(false);
  });

  it('stays active for the whole of the end date, not just its first instant', () => {
    // The previous implementation compared against the current instant, so an
    // agreement ending today flipped to Expired at 00:00 UTC — i.e. for the
    // entirety of its final day. It must stay active all day, matching the
    // public site's `agreement_end_date >= today` filter.
    const lateInTheDay = new Date('2026-09-15T23:59:59Z');

    expect(isAgreementExpired('2026-09-15', NOW)).toBe(false);
    expect(isAgreementExpired('2026-09-15', lateInTheDay)).toBe(false);
    // and expires once the day has actually rolled over
    expect(
      isAgreementExpired('2026-09-15', new Date('2026-09-16T00:00:00Z')),
    ).toBe(true);
  });

  it('ignores an unparseable end date rather than reporting expired', () => {
    expect(isAgreementExpired('not-a-date', NOW)).toBe(false);
  });
});

describe('getAgreementStatusBadge', () => {
  it('labels an open-ended agreement Active', () => {
    expect(getAgreementStatusBadge(undefined).label).toBe('Active');
  });

  it('labels a past agreement Expired', () => {
    expect(getAgreementStatusBadge('2020-01-01').label).toBe('Expired');
  });

  it('labels a cancelled agreement Expired even with a future end date', () => {
    expect(getAgreementStatusBadge('2030-12-31', true).label).toBe('Expired');
  });

  it('labels a cancelled open-ended agreement Expired', () => {
    expect(getAgreementStatusBadge(undefined, true).label).toBe('Expired');
  });

  it('still labels an uncancelled future agreement Active', () => {
    expect(getAgreementStatusBadge('2030-12-31', false).label).toBe('Active');
  });
});

describe('formatAgreementDate', () => {
  it('renders the API date without shifting the day', () => {
    // Parsed as UTC; appending a local time would move this to Dec 31 for
    // viewers east of UTC.
    expect(formatAgreementDate('2024-01-01')).toBe('January 1, 2024');
  });

  it('returns an empty string for missing or invalid values', () => {
    expect(formatAgreementDate(undefined)).toBe('');
    expect(formatAgreementDate(null)).toBe('');
    expect(formatAgreementDate('nonsense')).toBe('');
  });
});

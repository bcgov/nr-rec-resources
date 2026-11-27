import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  activeAdvisoryWhere,
  adminSearchSelect,
  withActiveAdvisories,
} from '@/recreation-resources/recreation-resource.select';

describe('activeAdvisoryWhere', () => {
  it('only matches published, unexpired advisories already in effect', () => {
    const now = new Date('2026-06-01T12:00:00Z');

    expect(activeAdvisoryWhere(now)).toEqual({
      published_at: { not: null },
      AND: [
        { OR: [{ expiry_date: null }, { expiry_date: { gt: now } }] },
        { OR: [{ effective_date: null }, { effective_date: { lte: now } }] },
      ],
    });
  });
});

describe('withActiveAdvisories', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds the active filter and keeps the ranking', () => {
    const select = withActiveAdvisories(adminSearchSelect);

    expect(select.act_advisories_flat).toMatchObject({
      where: { published_at: { not: null } },
      orderBy: adminSearchSelect.act_advisories_flat.orderBy,
      take: 1,
    });
  });

  it('uses the current time on every call, not when the module loaded', () => {
    vi.useFakeTimers();
    const later = new Date('2030-01-01T00:00:00Z');
    vi.setSystemTime(later);

    expect(
      withActiveAdvisories(adminSearchSelect).act_advisories_flat,
    ).toMatchObject({ where: activeAdvisoryWhere(later) });
  });
});

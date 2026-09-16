import { isFilterFieldVisibleTo } from '@/pages/search/constants';
import { isColumnVisibleTo } from '@/pages/search/searchDefinitions';
import { describe, expect, it } from 'vitest';

const CONTEXTS = {
  prodSuper: { isProduction: true, isSuperAdmin: true },
  prodRegular: { isProduction: true, isSuperAdmin: false },
  devSuper: { isProduction: false, isSuperAdmin: true },
  devRegular: { isProduction: false, isSuperAdmin: false },
};
const EVERY_CONTEXT = Object.values(CONTEXTS);

const publicAccessFilter = { key: 'publicAccessStatus', isNonProdOnly: true };
const ftaStatusFilter = { key: 'status', isSuperAdminOnly: true };
const ungatedFilter = { key: 'district' };

describe('isColumnVisibleTo', () => {
  it('shows public access status outside production only', () => {
    expect(isColumnVisibleTo('public_access_status', CONTEXTS.devSuper)).toBe(
      true,
    );
    expect(isColumnVisibleTo('public_access_status', CONTEXTS.devRegular)).toBe(
      true,
    );
    expect(isColumnVisibleTo('public_access_status', CONTEXTS.prodSuper)).toBe(
      false,
    );
    expect(
      isColumnVisibleTo('public_access_status', CONTEXTS.prodRegular),
    ).toBe(false);
  });

  it('restricts FTA status to super admins outside production', () => {
    expect(isColumnVisibleTo('status', CONTEXTS.devSuper)).toBe(true);
    expect(isColumnVisibleTo('status', CONTEXTS.devRegular)).toBe(false);
  });

  it('shows FTA status to everyone in production', () => {
    expect(isColumnVisibleTo('status', CONTEXTS.prodSuper)).toBe(true);
    expect(isColumnVisibleTo('status', CONTEXTS.prodRegular)).toBe(true);
  });

  it('leaves ungated columns alone', () => {
    for (const context of EVERY_CONTEXT) {
      expect(isColumnVisibleTo('district', context)).toBe(true);
    }
  });

  // The one combination we can't ship: no status at all.
  it('never hides both status sources at once', () => {
    for (const context of EVERY_CONTEXT) {
      expect(
        isColumnVisibleTo('public_access_status', context) ||
          isColumnVisibleTo('status', context),
      ).toBe(true);
    }
  });
});

describe('isFilterFieldVisibleTo', () => {
  it('shows public access status outside production only', () => {
    expect(
      isFilterFieldVisibleTo(publicAccessFilter, CONTEXTS.devRegular),
    ).toBe(true);
    expect(isFilterFieldVisibleTo(publicAccessFilter, CONTEXTS.prodSuper)).toBe(
      false,
    );
  });

  it('restricts FTA status to super admins outside production', () => {
    expect(isFilterFieldVisibleTo(ftaStatusFilter, CONTEXTS.devSuper)).toBe(
      true,
    );
    expect(isFilterFieldVisibleTo(ftaStatusFilter, CONTEXTS.devRegular)).toBe(
      false,
    );
  });

  it('shows FTA status to everyone in production', () => {
    expect(isFilterFieldVisibleTo(ftaStatusFilter, CONTEXTS.prodRegular)).toBe(
      true,
    );
  });

  it('leaves ungated fields alone', () => {
    for (const context of EVERY_CONTEXT) {
      expect(isFilterFieldVisibleTo(ungatedFilter, context)).toBe(true);
    }
  });

  // A filter with no matching column (or the reverse) is the bug to catch.
  it('agrees with the column gate for the same concept', () => {
    for (const context of EVERY_CONTEXT) {
      expect(isFilterFieldVisibleTo(publicAccessFilter, context)).toBe(
        isColumnVisibleTo('public_access_status', context),
      );
      expect(isFilterFieldVisibleTo(ftaStatusFilter, context)).toBe(
        isColumnVisibleTo('status', context),
      );
    }
  });
});

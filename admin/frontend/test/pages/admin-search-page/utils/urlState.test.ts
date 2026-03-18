import {
  clearAdminSearchState,
  serializeAdminSearchRouteState,
  setAdminSearchAccessFilter,
  setAdminSearchEstablishmentDateFromFilter,
  setAdminSearchEstablishmentDateToFilter,
  setAdminSearchTypeFilter,
  submitAdminSearchQuery,
} from '@/pages/admin-search-page/utils/urlState';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/admin-search-page/constants';
import { validateAdminSearch } from '@/pages/admin-search-page/utils/searchSchema';
import { describe, expect, it } from 'vitest';

const baseState = {
  ...DEFAULT_ADMIN_SEARCH_STATE,
  page: 4,
  q: 'old query',
  type: ['RTR'],
  access: ['W'],
  defined_campsites: 'yes' as const,
  closest_community: 'Hope',
  establishment_date_from: '2020-01-01',
  establishment_date_to: '2021-01-01',
};

describe('admin search urlState helpers', () => {
  it('resets page when submitting query', () => {
    expect(submitAdminSearchQuery(baseState, '  tamihi  ')).toMatchObject({
      q: 'tamihi',
      page: 1,
    });
  });

  it('resets page when changing multi-select filters', () => {
    expect(setAdminSearchTypeFilter(baseState, ['SIT'])).toMatchObject({
      type: ['SIT'],
      page: 1,
    });
    expect(setAdminSearchAccessFilter(baseState, ['B'])).toMatchObject({
      access: ['B'],
      page: 1,
    });
  });

  it('normalizes optional date filter values', () => {
    expect(
      setAdminSearchEstablishmentDateFromFilter(baseState, undefined),
    ).toMatchObject({
      establishment_date_from: undefined,
      page: 1,
    });

    expect(
      setAdminSearchEstablishmentDateToFilter(baseState, ''),
    ).toMatchObject({
      establishment_date_to: undefined,
      page: 1,
    });
  });

  it('serializes hidden compatibility filters when present', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        defined_campsites: 'yes',
        closest_community: '  Hope  ',
      }),
    ).toEqual({
      defined_campsites: 'yes',
      closest_community: 'Hope',
    });
  });

  it('clears search state back to defaults', () => {
    expect(clearAdminSearchState(baseState)).toEqual({
      ...baseState,
      ...DEFAULT_ADMIN_SEARCH_STATE,
      page: 1,
    });
  });

  it('serializes default state to an empty search object', () => {
    expect(serializeAdminSearchRouteState(DEFAULT_ADMIN_SEARCH_STATE)).toEqual(
      {},
    );
  });

  it('omits empty values and preserves non-default params when serializing', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        q: '  tamihi  ',
        page: 3,
        district: ['RDCS'],
        access: ['W'],
        closest_community: '  Hope  ',
      }),
    ).toEqual({
      q: 'tamihi',
      page: 3,
      district: 'RDCS',
      access: 'W',
      closest_community: 'Hope',
    });
  });

  it('serializes multi-select filters with underscore delimiters', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        type: ['IFT'],
        district: ['RDCO'],
        activities: ['8', '12'],
        access: ['W', 'B'],
      }),
    ).toEqual({
      type: 'IFT',
      district: 'RDCO',
      activities: '8_12',
      access: 'W_B',
    });
  });

  it('serializes sort with an underscore delimiter for readable urls', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        sort: 'rec_resource_id:desc',
      }),
    ).toEqual({
      sort: 'rec_resource_id_desc',
    });
  });

  it('normalizes legacy quoted single-value filters', () => {
    expect(
      validateAdminSearch({
        activities: '"8"',
      }),
    ).toEqual({
      activities: '8',
    });
  });

  it('accepts legacy and readable sort tokens', () => {
    expect(
      validateAdminSearch({
        sort: 'rec_resource_id_desc',
      }),
    ).toEqual({
      sort: 'rec_resource_id_desc',
    });

    expect(
      validateAdminSearch({
        sort: 'closest_community:desc',
      }),
    ).toEqual({
      sort: 'community_desc',
    });
  });
});

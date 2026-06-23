import {
  clearAdminSearchState,
  serializeAdminSearchRouteState,
  setAdminSearchAccessFilter,
  setAdminSearchEstablishmentDateFromFilter,
  setAdminSearchEstablishmentDateToFilter,
  setAdminSearchEstablishedFilter,
  setAdminSearchPageSize,
  setAdminSearchPublicAccessStatusFilter,
  setAdminSearchRecStatusFilter,
  setAdminSearchTypeFilter,
  submitAdminSearchQuery,
} from '@/pages/search/utils/urlState';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import { validateAdminSearch } from '@/pages/search/utils/searchSchema';
import { describe, expect, it } from 'vitest';

const baseState = {
  ...DEFAULT_ADMIN_SEARCH_STATE,
  page: 4,
  q: 'old query',
  type: ['RTR'],
  access: ['W'],
  page_size: 50,
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

  it('sets established filter and resets page', () => {
    expect(setAdminSearchEstablishedFilter(baseState, 'yes')).toMatchObject({
      established: 'yes',
      page: 1,
    });

    expect(setAdminSearchEstablishedFilter(baseState, 'no')).toMatchObject({
      established: 'no',
      page: 1,
    });

    expect(setAdminSearchEstablishedFilter(baseState, undefined)).toMatchObject(
      {
        established: undefined,
        page: 1,
      },
    );
  });

  it('resets page when changing page size', () => {
    expect(setAdminSearchPageSize(baseState, 100)).toMatchObject({
      page: 1,
      page_size: 100,
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
        page_size: 50,
        district: ['RDCS'],
        access: ['W'],
      }),
    ).toEqual({
      q: 'tamihi',
      page: 3,
      page_size: 50,
      district: 'RDCS',
      access: 'W',
    });
  });

  it('serializes established filter in search state', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        established: 'yes',
      }),
    ).toEqual({
      established: 'yes',
    });

    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        established: 'no',
      }),
    ).toEqual({
      established: 'no',
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
        closestCommunity: ['COMMUNITY1', 'COMMUNITY2'],
      }),
    ).toEqual({
      type: 'IFT',
      district: 'RDCO',
      activities: '8_12',
      access: 'W_B',
      closestCommunity: 'COMMUNITY1_COMMUNITY2',
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

  it('serializes publicAccessStatus filter with underscore delimiter', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        publicAccessStatus: ['Open', 'Closed'],
      }),
    ).toEqual({
      publicAccessStatus: 'Open_Closed',
    });
  });

  it('omits publicAccessStatus from serialized state when empty', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        publicAccessStatus: [],
      }),
    ).toEqual({});
  });

  it('serializes recStatus filter with underscore delimiter', () => {
    expect(
      serializeAdminSearchRouteState({
        ...DEFAULT_ADMIN_SEARCH_STATE,
        recStatus: ['HI', 'AR'],
      }),
    ).toEqual({
      recStatus: 'HI_AR',
    });
  });

  it('sets publicAccessStatus filter and resets page', () => {
    expect(
      setAdminSearchPublicAccessStatusFilter(baseState, [
        'Closed',
        'Restricted',
      ]),
    ).toMatchObject({
      publicAccessStatus: ['Closed', 'Restricted'],
      page: 1,
    });
  });

  it('sets recStatus filter and resets page', () => {
    expect(
      setAdminSearchRecStatusFilter(baseState, ['HI', 'AR']),
    ).toMatchObject({
      recStatus: ['HI', 'AR'],
      page: 1,
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
        sort: 'community:desc',
      }),
    ).toEqual({
      sort: 'community_desc',
    });
  });
});

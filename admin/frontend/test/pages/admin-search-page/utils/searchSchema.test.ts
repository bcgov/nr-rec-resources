import { describe, expect, it } from 'vitest';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import {
  normalizeVisibleAdminSearchColumns,
  resolveAdminSearchRouteState,
  validateAdminSearch,
} from '@/pages/search/utils/searchSchema';

describe('validateAdminSearch', () => {
  it('drops invalid params instead of materializing default params into the URL state', () => {
    expect(
      validateAdminSearch({
        sort: 'broken',
        page: '0',
        q: '   ',
        defined_campsites: 'maybe',
      }),
    ).toEqual({});
  });

  it('parses token lists, trims strings, and keeps only explicit non-default params', () => {
    expect(
      validateAdminSearch({
        q: '  tamihi  ',
        sort: 'campsite_count:desc',
        page: '3',
        page_size: '50',
        type: 'RR_RTR',
        district: 'DCK_DRM',
        activities: '1_2',
        access: 'W',
        defined_campsites: 'yes',
        closest_community: '  Hope ',
        establishment_date_from: '2020-01-01',
        establishment_date_to: '2021-01-01',
      }),
    ).toEqual({
      q: 'tamihi',
      sort: 'campsites_desc',
      page: 3,
      page_size: 50,
      type: 'RR_RTR',
      district: 'DCK_DRM',
      activities: '1_2',
      access: 'W',
      defined_campsites: 'yes',
      closest_community: 'Hope',
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-01-01',
    });
  });

  it('resolves validated route search back into the full in-memory search state', () => {
    expect(
      resolveAdminSearchRouteState({
        q: 'tamihi',
        sort: 'closest_community_desc',
        page: 3,
        page_size: 100,
        type: 'RR_RTR',
        district: 'DCK_DRM',
        activities: '1_2',
        access: 'W',
        defined_campsites: 'no',
      }),
    ).toEqual({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: 'tamihi',
      sort: 'community:desc',
      page: 3,
      page_size: 100,
      type: ['RR', 'RTR'],
      district: ['DCK', 'DRM'],
      activities: ['1', '2'],
      access: ['W'],
      defined_campsites: 'no',
    });
  });

  it('keeps only supported visible-column ids from stored preferences', () => {
    expect(
      normalizeVisibleAdminSearchColumns(
        'rec_resource_id,name,recreation_resource_type,last_updated,map,details',
      ),
    ).toEqual(['rec_resource_id', 'name', 'recreation_resource_type']);
  });
});

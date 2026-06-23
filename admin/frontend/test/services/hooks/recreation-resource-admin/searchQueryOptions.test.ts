import { describe, expect, it, vi } from 'vitest';
import {
  buildAdminSearchRequest,
  getAdminSearchQueryOptions,
} from '@/services/hooks/recreation-resource-admin/searchQueryOptions';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';

describe('buildAdminSearchRequest', () => {
  it('maps default state with empty arrays to undefined filter fields', () => {
    const result = buildAdminSearchRequest(DEFAULT_ADMIN_SEARCH_STATE);

    expect(result.type).toBeUndefined();
    expect(result.district).toBeUndefined();
    expect(result.activities).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.access).toBeUndefined();
    expect(result.closestCommunity).toBeUndefined();
    expect(result.publicAccessStatus).toBeUndefined();
    expect(result.recStatus).toBeUndefined();
  });

  it('passes publicAccessStatus array when non-empty', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      publicAccessStatus: ['Closed', 'Restricted'],
    });

    expect(result.publicAccessStatus).toEqual(['Closed', 'Restricted']);
  });

  it('omits publicAccessStatus when empty array', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      publicAccessStatus: [],
    });

    expect(result.publicAccessStatus).toBeUndefined();
  });

  it('passes recStatus array when non-empty', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      recStatus: ['HI', 'AR'],
    });

    expect(result.recStatus).toEqual(['HI', 'AR']);
  });

  it('maps q, sort, page, pageSize from search state', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: 'lake',
      sort: 'name:desc',
      page: 3,
      page_size: 50,
    });

    expect(result.q).toBe('lake');
    expect(result.sort).toBe('name:desc');
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it('sets q to undefined when empty string', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: '',
    });

    expect(result.q).toBeUndefined();
  });

  it('passes non-empty type, district, activities, status, access, closestCommunity', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      type: ['RTR'],
      district: ['D1'],
      activities: ['8'],
      status: ['1'],
      access: ['W'],
      closestCommunity: ['WHISTLER'],
    });

    expect(result.type).toEqual(['RTR']);
    expect(result.district).toEqual(['D1']);
    expect(result.activities).toEqual(['8']);
    expect(result.status).toEqual(['1']);
    expect(result.access).toEqual(['W']);
    expect(result.closestCommunity).toEqual(['WHISTLER']);
  });

  it('passes established and date range as-is', () => {
    const result = buildAdminSearchRequest({
      ...DEFAULT_ADMIN_SEARCH_STATE,
      established: 'yes',
      establishment_date_from: '2020-01-01',
      establishment_date_to: '2021-12-31',
    });

    expect(result.established).toBe('yes');
    expect(result.establishmentDateFrom).toBe('2020-01-01');
    expect(result.establishmentDateTo).toBe('2021-12-31');
  });

  it('builds query options that call the admin search API with the mapped request', async () => {
    const apiClient = {
      searchRecreationResources: vi
        .fn()
        .mockResolvedValue({ data: [], total: 0 }),
    };
    const search = {
      ...DEFAULT_ADMIN_SEARCH_STATE,
      q: 'lake',
      recStatus: ['HI'],
    };

    const options = getAdminSearchQueryOptions(apiClient as any, search);
    const result = await options.queryFn();

    expect(options.queryKey).toEqual([
      'recreation-resource-admin',
      'search',
      {
        q: 'lake',
        sort: 'name:asc',
        page: 1,
        pageSize: 25,
        type: undefined,
        district: undefined,
        activities: undefined,
        status: undefined,
        access: undefined,
        closestCommunity: undefined,
        establishmentDateFrom: undefined,
        establishmentDateTo: undefined,
        established: undefined,
        publicAccessStatus: undefined,
        recStatus: ['HI'],
      },
    ]);
    expect(apiClient.searchRecreationResources).toHaveBeenCalledWith({
      q: 'lake',
      sort: 'name:asc',
      page: 1,
      pageSize: 25,
      type: undefined,
      district: undefined,
      activities: undefined,
      status: undefined,
      access: undefined,
      closestCommunity: undefined,
      establishmentDateFrom: undefined,
      establishmentDateTo: undefined,
      established: undefined,
      publicAccessStatus: undefined,
      recStatus: ['HI'],
    });
    expect(result).toEqual({ data: [], total: 0 });
    expect(options.staleTime).toBe(30_000);
    expect(options.retry(0, { response: { status: 500 } } as any)).toBe(true);
    expect(options.retry(2, { response: { status: 500 } } as any)).toBe(false);
  });
});

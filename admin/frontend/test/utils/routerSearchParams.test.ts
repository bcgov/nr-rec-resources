import {
  parseRouterSearch,
  stringifyRouterSearch,
} from '@/utils/routerSearchParams';
import { describe, expect, it } from 'vitest';

describe('routerSearchParams', () => {
  it('serializes scalar string filters without json quotes', () => {
    expect(
      stringifyRouterSearch({
        activities: '8',
        q: 'lake',
        page: 2,
      }),
    ).toBe('?activities=8&q=lake&page=2');
  });

  it('parses repeated keys into arrays', () => {
    expect(
      parseRouterSearch('?activities=8&activities=12&district=RDCS'),
    ).toEqual({
      activities: ['8', '12'],
      district: 'RDCS',
    });
  });
});

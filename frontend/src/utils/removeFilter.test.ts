import { describe, expect } from 'vitest';
import removeFilter from '@/utils/removeFilter';

describe('removeFilter function', () => {
  it('should remove a filter from the search params', () => {
    const searchParams = new URLSearchParams('activity=1_2_3');
    const id = '2';
    const result = removeFilter(id, 'activity', searchParams);
    expect(result).toEqual('1_3');
  });

  it('should return undefined if the filter is not found', () => {
    const searchParams = new URLSearchParams('activity=1_2_3');
    const id = '4';
    const result = removeFilter(id, 'act', searchParams);
    expect(result).toEqual(undefined);
  });

  it('should return undefined if there are no filters', () => {
    const searchParams = new URLSearchParams();
    const id = '1';
    const result = removeFilter(id, 'activity', searchParams);
    expect(result).toEqual(undefined);
  });
});

import { describe, expect, it } from 'vitest';
import { getFilterState, haveFiltersChanged } from './helpers';
import { URLSearchFilterParams } from './types';

describe('getFilterState', () => {
  it('should extract filter parameters from URLSearchParams', () => {
    const searchParams = new URLSearchParams({
      activities: 'hiking',
      type: 'outdoor',
      filter: 'popular',
      district: 'north',
      access: 'public',
      facilities: 'parking',
    });

    const result = getFilterState(searchParams);

    expect(result).toEqual({
      activities: 'hiking',
      type: 'outdoor',
      filter: 'popular',
      district: 'north',
      access: 'public',
      facilities: 'parking',
    });
  });

  it('should return undefined for missing parameters', () => {
    const searchParams = new URLSearchParams({
      activities: 'hiking',
    });

    const result = getFilterState(searchParams);

    expect(result).toEqual({
      activities: 'hiking',
      type: undefined,
      filter: undefined,
      district: undefined,
      access: undefined,
      facilities: undefined,
    });
  });
});

describe('haveFiltersChanged', () => {
  it('should return true when filters are different', () => {
    const current: URLSearchFilterParams = {
      activities: 'hiking',
      type: 'outdoor',
    };
    const prev: URLSearchFilterParams = {
      activities: 'biking',
      type: 'outdoor',
    };

    expect(haveFiltersChanged(current, prev)).toBe(true);
  });

  it('should return false when filters are the same', () => {
    const current: URLSearchFilterParams = {
      activities: 'hiking',
      type: 'outdoor',
    };
    const prev: URLSearchFilterParams = {
      activities: 'hiking',
      type: 'outdoor',
    };

    expect(haveFiltersChanged(current, prev)).toBe(false);
  });
});

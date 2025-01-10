import { describe, expect } from 'vitest';
import buildQueryString from 'src/utils/buildQueryString';

describe('buildQueryString function', () => {
  it('should return a query string from an object of key-value pairs', () => {
    const queryParams = {
      page: '1',
      filter: 'filter',
      sort_direction: 'asc',
      sort_field: 'name',
    };
    const result = buildQueryString(queryParams);
    expect(result).toEqual(
      '?page=1&filter=filter&sort_direction=asc&sort_field=name',
    );
  });

  it('should return a query string without empty or undefined values', () => {
    const queryParams = {
      page: '1',
      search: '',
      sort: undefined,
    };
    const result = buildQueryString(queryParams);
    expect(result).toEqual('?page=1');
  });
});

import { act, renderHook } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';
import * as ReactRouterDom from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/routes';
import { City } from '@/components/recreation-suggestion-form/types';

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [
    new URLSearchParams({ filter: 'test' }),
    mockSetSearchParams,
  ],
  useNavigate: () => mockNavigate,
}));

describe('useSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty string when no filter or community param is provided', () => {
    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('');
    expect(result.current.searchInputValue).toBe('');
  });

  it('should initialize with filter search param value', () => {
    const searchParams = new URLSearchParams({ filter: 'test' });

    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      searchParams,
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('test');
    expect(result.current.searchInputValue).toBe('test');
  });

  it('should update searchInputValue when setSearchInputValue is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('new value');
    });

    expect(result.current.searchInputValue).toBe('new value');
  });

  it('should clear searchInputValue and selectedCity when handleClearSearch is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('some value');
      result.current.setSelectedCity([
        { id: 1, name: 'City1', latitude: 1, longitude: 2 },
      ]);
    });

    expect(result.current.searchInputValue).toBe('some value');
    expect(result.current.selectedCity.length).toBe(1);

    act(() => {
      result.current.handleClearSearch();
    });

    expect(result.current.searchInputValue).toBe('');
    expect(result.current.selectedCity).toEqual([]);
    expect(mockSetSearchParams).toHaveBeenCalledWith(new URLSearchParams());
  });

  it('should trim input value and navigate with filter param when handleSearch is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('  test  ');
    });

    act(() => {
      result.current.handleSearch();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: ROUTE_PATHS.SEARCH,
      search: 'filter=test',
    });
  });

  it('should handle city option search and update params correctly', () => {
    const city: City = {
      id: 1,
      name: 'Vancouver',
      latitude: 49.2827,
      longitude: -123.1207,
    };

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleCityOptionSearch(city);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: ROUTE_PATHS.SEARCH,
      search: expect.stringContaining('community=Vancouver'),
    });

    expect(result.current.selectedCity).toEqual([city]);
  });

  it('should clear typeahead search params and reset searchInputValue and selectedCity when handleClearTypeaheadSearch is called', () => {
    const params = new URLSearchParams({
      filter: 'some',
      lat: '49.0',
      lon: '-123.0',
      community: 'Vancouver',
    });
    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      params,
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('some');
      result.current.setSelectedCity([
        { id: 1, name: 'Vancouver', latitude: 49, longitude: -123 },
      ]);
    });

    act(() => {
      result.current.handleClearTypeaheadSearch();
    });

    expect(result.current.searchInputValue).toBe('');
    expect(result.current.selectedCity).toEqual([]);

    // It should call setSearchParams with params that no longer include filter, lat, lon, community
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('should initialize defaultSearchInputValue from community param if filter param is absent', () => {
    const searchParams = new URLSearchParams({ community: 'Victoria' });

    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      searchParams,
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('Victoria');
  });
});

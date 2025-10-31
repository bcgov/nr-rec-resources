import { act, renderHook } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';
import * as TanStackRouter from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/constants/routes';
import { City } from '@/components/recreation-suggestion-form/types';
import { OPTION_TYPE } from '@/components/recreation-suggestion-form/constants';
import React from 'react';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useSearch: vi.fn(() => ({ filter: 'test' })),
    useRouterState: vi.fn(() => ({ filter: 'test' })),
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) =>
      React.createElement('a', { href: to, ...props }, children),
  };
});

describe('useSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty string when no filter or community param is provided', () => {
    vi.spyOn(TanStackRouter, 'useSearch').mockReturnValue({});
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({});

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('');
    expect(result.current.searchInputValue).toBe('');
  });

  it('should initialize with filter search param value', () => {
    vi.spyOn(TanStackRouter, 'useSearch').mockReturnValue({ filter: 'test' });
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({
      filter: 'test',
    });

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('test');
    expect(result.current.searchInputValue).toBe('test');
  });

  it('should update searchInputValue when setSearchInputValue is called', () => {
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({
      filter: 'test',
    });

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('new value');
    });

    expect(result.current.searchInputValue).toBe('new value');
  });

  it('should clear searchInputValue and selectedCity when handleClearSearch is called', () => {
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({
      filter: 'test',
    });

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('some value');
      result.current.setSelectedCity([
        {
          id: 1,
          name: 'City1',
          latitude: 1,
          longitude: 2,
          option_type: OPTION_TYPE.CITY,
        },
      ]);
    });

    expect(result.current.searchInputValue).toBe('some value');
    expect(result.current.selectedCity?.length).toBe(1);

    act(() => {
      result.current.handleClearSearch();
    });

    expect(result.current.searchInputValue).toBe('');
    expect(result.current.selectedCity).toEqual([]);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.SEARCH,
      search: {},
    });
  });

  it('should trim input value and navigate with filter param when handleSearch is called', () => {
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({});

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('  test  ');
    });

    act(() => {
      result.current.handleSearch('test');
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.SEARCH,
      search: { filter: 'test' },
    });
  });

  it('should handle city option search and update params correctly', () => {
    const city: City = {
      id: 1,
      name: 'Vancouver',
      latitude: 49.2827,
      longitude: -123.1207,
      option_type: OPTION_TYPE.CITY,
    };

    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({});

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleCityOptionSearch(city);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.SEARCH,
      search: expect.objectContaining({
        community: 'Vancouver',
        lat: '49.2827',
        lon: '-123.1207',
      }),
    });

    expect(result.current.selectedCity).toEqual([city]);
  });

  it('should clear typeahead search params and reset searchInputValue and selectedCity when handleClearTypeaheadSearch is called', () => {
    vi.spyOn(TanStackRouter, 'useSearch').mockReturnValue({
      filter: 'some',
      lat: '49.0',
      lon: '-123.0',
      community: 'Vancouver',
    });
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({
      filter: 'some',
      lat: '49.0',
      lon: '-123.0',
      community: 'Vancouver',
    });

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setSearchInputValue('some');
      result.current.setSelectedCity([
        {
          id: 1,
          name: 'Vancouver',
          latitude: 49,
          longitude: -123,
          option_type: OPTION_TYPE.CITY,
        },
      ]);
    });

    act(() => {
      result.current.handleClearTypeaheadSearch();
    });

    expect(result.current.searchInputValue).toBe('');
    expect(result.current.selectedCity).toEqual([]);

    // It should call navigate with an empty search object
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.SEARCH,
      search: {},
    });
  });

  it('should initialize defaultSearchInputValue from community param if filter param is absent', () => {
    vi.spyOn(TanStackRouter, 'useSearch').mockReturnValue({
      community: 'Victoria',
    });
    vi.spyOn(TanStackRouter, 'useRouterState').mockReturnValue({
      community: 'Victoria',
    });

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.defaultSearchInputValue).toBe('Victoria');
  });
});

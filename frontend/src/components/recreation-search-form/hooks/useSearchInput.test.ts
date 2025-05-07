import { act, renderHook } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';
import * as ReactRouterDom from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/routes';
import { City } from '@/components/recreation-search-form/types';

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

  it('should initialize with empty string when no filter search param is provided', () => {
    vi.mock('react-router-dom', () => ({
      useSearchParams: () => [new URLSearchParams(), vi.fn()],
      useNavigate: () => mockNavigate,
    }));

    const { result } = renderHook(() => useSearchInput());
    expect(result.current.nameInputValue).toBe('');
  });

  it('should initialize with filter search param value', () => {
    const searchParams = new URLSearchParams({ filter: 'test' });
    const mockSetSearchParams = vi.fn();

    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      searchParams,
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.nameInputValue).toBe('test');
  });

  it('should update input value when setNameInputValue is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setNameInputValue('new value');
    });

    expect(result.current.nameInputValue).toBe('new value');
  });

  it('should clear input value when handleClearNameInput is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleClearNameInput();
    });

    expect(result.current.nameInputValue).toBe('');
  });

  it('should trim input value when performing search', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setNameInputValue('  test  ');
    });

    result.current.handleSearch();

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: ROUTE_PATHS.SEARCH,
      search: 'filter=test',
    });
  });

  it('should handle city input search and update params', () => {
    const city: City = {
      id: 1,
      cityName: 'Vancouver',
      latitude: 49.2827,
      longitude: -123.1207,
    };

    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.handleCityInputSearch(city);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: ROUTE_PATHS.SEARCH,
      search: expect.stringContaining('community=Vancouver'),
    });
  });

  it('should clear city input and remove location params', () => {
    const searchParams = new URLSearchParams({ community: 'Victoria' });
    const mockSetSearchParams = vi.fn();

    vi.spyOn(ReactRouterDom, 'useSearchParams').mockReturnValue([
      searchParams,
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchInput());

    expect(result.current.cityInputValue).toBe('Victoria');

    act(() => {
      result.current.handleClearCityInput();
    });

    expect(result.current.cityInputValue).toBe('');
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should update city input value when setCityInputValue is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setCityInputValue('Victoria');
    });

    expect(result.current.cityInputValue).toBe('Victoria');
  });

  it('should update selectedCity when setSelectedCity is called', () => {
    const { result } = renderHook(() => useSearchInput());

    const city: City = {
      id: 1,
      cityName: 'Victoria',
      latitude: 48.4284,
      longitude: -123.3656,
    };

    act(() => {
      result.current.setSelectedCity([city]);
    });

    expect(result.current.selectedCity).toEqual([city]);
  });
});

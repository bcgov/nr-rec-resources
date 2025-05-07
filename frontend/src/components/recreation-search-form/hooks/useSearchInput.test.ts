import { act, renderHook } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/routes';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ filter: 'test' }), vi.fn()],
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
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setNameInputValue('test');
    });

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
});

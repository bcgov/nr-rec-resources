import { act, renderHook } from '@testing-library/react';
import { useSearchInput } from './useSearchInput';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTE_PATHS } from '@/routes';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useNavigate: () => mockNavigate,
}));

describe('useSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty string when no initial value provided', () => {
    const { result } = renderHook(() => useSearchInput());
    expect(result.current.inputValue).toBe('');
  });

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() =>
      useSearchInput({ initialValue: 'test' }),
    );
    expect(result.current.inputValue).toBe('test');
  });

  it('should update input value when setInputValue is called', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setInputValue('new value');
    });

    expect(result.current.inputValue).toBe('new value');
  });

  it('should clear input value when handleClear is called', () => {
    const { result } = renderHook(() =>
      useSearchInput({ initialValue: 'test' }),
    );

    act(() => {
      result.current.handleClear();
    });

    expect(result.current.inputValue).toBe('');
  });

  it('should trim input value when performing search', () => {
    const { result } = renderHook(() => useSearchInput());

    act(() => {
      result.current.setInputValue('  test  ');
    });

    result.current.handleSearch();

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: ROUTE_PATHS.SEARCH,
      search: 'filter=test',
    });
  });
});

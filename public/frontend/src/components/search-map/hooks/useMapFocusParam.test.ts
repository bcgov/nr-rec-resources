import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useMapFocusParam } from './useMapFocusParam';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { useSearchParams } from 'react-router-dom';

// mock useSearchParams from react-router-dom
vi.mock('react-router-dom', () => {
  return {
    useSearchParams: vi.fn(),
  };
});

describe('useMapFocusParam', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockSetSearchParams: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    mockDelete = vi.fn();
    mockSetSearchParams = vi.fn();

    (useSearchParams as unknown as Mock).mockReturnValue([
      { get: mockGet, delete: mockDelete } as any,
      mockSetSearchParams,
    ]);
  });

  it('returns undefined mode and value when no focus param is set', () => {
    mockGet.mockReturnValue(null);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBeUndefined();
    expect(result.current.value).toBeUndefined();
  });

  it('parses valid focus param into mode and value', () => {
    mockGet.mockReturnValue(`${SearchMapFocusModes.REC_RESOURCE_ID}:123`);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBe(SearchMapFocusModes.REC_RESOURCE_ID);
    expect(result.current.value).toBe('123');
  });

  it('returns undefined mode for invalid mode string', () => {
    mockGet.mockReturnValue('invalid:456');

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBeUndefined();
    expect(result.current.value).toBe('456');
  });

  it('returns value as undefined when focus param has no value', () => {
    mockGet.mockReturnValue(SearchMapFocusModes.REC_RESOURCE_ID);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBe(SearchMapFocusModes.REC_RESOURCE_ID);
    expect(result.current.value).toBeUndefined();
  });

  it('resetParams deletes focus param and updates search params', () => {
    mockGet.mockReturnValue(`${SearchMapFocusModes.REC_RESOURCE_ID}:789`);

    const { result } = renderHook(() => useMapFocusParam());

    act(() => {
      result.current.resetParams();
    });

    expect(mockDelete).toHaveBeenCalledWith('focus');
    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Object), {
      replace: true,
    });
  });
});

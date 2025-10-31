import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useMapFocusParam } from './useMapFocusParam';
import { SearchMapFocusModes } from '@/components/search-map/constants';
import { useSearch, useNavigate } from '@tanstack/react-router';

// mock TanStack Router hooks
vi.mock('@tanstack/react-router', () => {
  return {
    useSearch: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('useMapFocusParam', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSearchParams: any;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSearchParams = {};

    (useSearch as unknown as Mock).mockReturnValue(mockSearchParams);
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
  });

  it('returns undefined mode and value when no focus param is set', () => {
    mockSearchParams = {};

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBeUndefined();
    expect(result.current.value).toBeUndefined();
  });

  it('parses valid focus param into mode and value', () => {
    mockSearchParams = { focus: `${SearchMapFocusModes.REC_RESOURCE_ID}:123` };
    (useSearch as unknown as Mock).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBe(SearchMapFocusModes.REC_RESOURCE_ID);
    expect(result.current.value).toBe('123');
  });

  it('returns undefined mode for invalid mode string', () => {
    mockSearchParams = { focus: 'invalid:456' };
    (useSearch as unknown as Mock).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBeUndefined();
    expect(result.current.value).toBe('456');
  });

  it('returns value as undefined when focus param has no value', () => {
    mockSearchParams = { focus: SearchMapFocusModes.REC_RESOURCE_ID };
    (useSearch as unknown as Mock).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useMapFocusParam());

    expect(result.current.mode).toBe(SearchMapFocusModes.REC_RESOURCE_ID);
    expect(result.current.value).toBeUndefined();
  });

  it('resetParams deletes focus param and updates search params', () => {
    mockSearchParams = { focus: `${SearchMapFocusModes.REC_RESOURCE_ID}:789` };
    (useSearch as unknown as Mock).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useMapFocusParam());

    act(() => {
      result.current.resetParams();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
      replace: true,
    });
  });
});

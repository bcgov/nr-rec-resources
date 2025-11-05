import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigateWithQueryParams } from '@shared/hooks/useNavigateWithQueryParams';

const mockNavigate = vi.fn();
const mockHistoryGo = vi.fn();
const mockLocation = { search: {} };

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useRouter: () => ({ history: { go: mockHistoryGo } }),
}));

describe('useNavigateWithQueryParams', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockHistoryGo.mockClear();
    mockLocation.search = {};
  });

  it('should preserve query params when navigating with NavigateOptions', () => {
    mockLocation.search = { enable_edit: 'true', tab: 'overview' };

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current({ to: '/new-page' });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page',
      search: { enable_edit: 'true', tab: 'overview' },
    });
  });

  it('should handle numeric navigation (go back)', () => {
    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current(-1);

    expect(mockHistoryGo).toHaveBeenCalledWith(-1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should pass through navigate options with params', () => {
    mockLocation.search = { param: 'value' };

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current({
      to: '/rec-resource/$id',
      params: { id: '123' },
      replace: true,
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/rec-resource/$id',
      params: { id: '123' },
      replace: true,
      search: { param: 'value' },
    });
  });

  it('should work when there are no query params', () => {
    mockLocation.search = {};

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current({ to: '/new-page' });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page',
      search: {},
    });
  });

  it('should override current search params when new ones are provided', () => {
    mockLocation.search = { old: 'param', shared: 'old' };

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current({
      to: '/new-page',
      search: { new: 'param', shared: 'new' },
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page',
      search: { new: 'param', shared: 'new' },
    });
  });
});

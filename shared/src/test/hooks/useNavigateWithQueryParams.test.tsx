import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigateWithQueryParams } from '@shared/hooks/useNavigateWithQueryParams';

const mockNavigate = vi.fn();
const mockLocation = { search: '' };

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('useNavigateWithQueryParams', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocation.search = '';
  });

  it('should preserve query params when navigating with string path', () => {
    mockLocation.search = '?enable_edit=true&tab=overview';

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current('/new-page');

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page?enable_edit=true&tab=overview',
      replace: undefined,
    });
  });

  it('should handle numeric navigation (go back)', () => {
    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current(-1);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: -1,
      replace: undefined,
    });
  });

  it('should pass through navigate options', () => {
    mockLocation.search = '?param=value';

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current('/new-page', { replace: true });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page?param=value',
      replace: true,
    });
  });

  it('should work when there are no query params', () => {
    mockLocation.search = '';

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current('/new-page');

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page',
      replace: undefined,
    });
  });

  it('should allow overriding query params by including them in the path', () => {
    mockLocation.search = '?old=param';

    const { result } = renderHook(() => useNavigateWithQueryParams());

    result.current('/new-page?new=param');

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/new-page?new=param?old=param',
      replace: undefined,
    });
  });
});

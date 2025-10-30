import { renderHook } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigateWithQueryParams } from '@shared/hooks/useNavigateWithQueryParams';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useNavigateWithQueryParams', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should preserve query params when navigating with string path', () => {
    window.history.pushState({}, '', '/current?enable_edit=true&tab=overview');

    const { result } = renderHook(
      () => {
        const navigate = useNavigateWithQueryParams();
        const location = useLocation();
        return { navigate, location };
      },
      { wrapper },
    );

    result.current.navigate('/new-page');

    expect(mockNavigate).toHaveBeenCalledWith(
      '/new-page?enable_edit=true&tab=overview',
      undefined,
    );
  });

  it('should preserve query params when navigating with object path', () => {
    window.history.pushState({}, '', '/current?enable_edit=true');

    const { result } = renderHook(() => useNavigateWithQueryParams(), {
      wrapper,
    });

    result.current({ pathname: '/new-page', hash: '#section' });

    expect(mockNavigate).toHaveBeenCalledWith(
      {
        pathname: '/new-page',
        hash: '#section',
        search: '?enable_edit=true',
      },
      undefined,
    );
  });

  it('should handle numeric navigation (go back)', () => {
    const { result } = renderHook(() => useNavigateWithQueryParams(), {
      wrapper,
    });

    result.current(-1);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should pass through navigate options', () => {
    window.history.pushState({}, '', '/current?param=value');

    const { result } = renderHook(() => useNavigateWithQueryParams(), {
      wrapper,
    });

    result.current('/new-page', { replace: true });

    expect(mockNavigate).toHaveBeenCalledWith('/new-page?param=value', {
      replace: true,
    });
  });

  it('should work when there are no query params', () => {
    window.history.pushState({}, '', '/current');

    const { result } = renderHook(() => useNavigateWithQueryParams(), {
      wrapper,
    });

    result.current('/new-page');

    expect(mockNavigate).toHaveBeenCalledWith('/new-page', undefined);
  });

  it('should prefer explicit search in object path over current search', () => {
    window.history.pushState({}, '', '/current?old=param');

    const { result } = renderHook(() => useNavigateWithQueryParams(), {
      wrapper,
    });

    result.current({ pathname: '/new-page', search: '?new=param' });

    expect(mockNavigate).toHaveBeenCalledWith(
      {
        pathname: '/new-page',
        search: '?new=param',
      },
      undefined,
    );
  });
});

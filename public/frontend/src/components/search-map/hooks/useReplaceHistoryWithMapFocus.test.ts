import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useReplaceHistoryWithMapFocus } from './useReplaceHistoryWithMapFocus';
import { ROUTE_PATHS } from '@/routes/constants';
import { SearchMapFocusModes } from '@/components/search-map/constants';

// Mock react-router-dom hooks
vi.mock('react-router-dom', () => {
  return {
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

describe('useReplaceHistoryWithMapFocus', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockUseNavigate: Mock;
  let mockUseLocation: Mock;

  beforeEach(async () => {
    vi.resetModules();
    mockNavigate = vi.fn();

    // Re-import to refresh mocks per test
    const rrd = await import('react-router-dom');
    mockUseNavigate = rrd.useNavigate as unknown as Mock;
    mockUseLocation = rrd.useLocation as unknown as Mock;

    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('replaces history with focused map when on /search?view=map', () => {
    mockUseLocation.mockReturnValue({
      pathname: ROUTE_PATHS.SEARCH,
      search: '?view=map',
    });

    const recResourceId = '123';
    const { result } = renderHook(() =>
      useReplaceHistoryWithMapFocus(recResourceId),
    );

    result.current();

    expect(mockNavigate).toHaveBeenCalledWith(
      {
        pathname: ROUTE_PATHS.SEARCH,
        search: `view=map&focus=${SearchMapFocusModes.REC_RESOURCE_ID}:${recResourceId}`,
      },
      { replace: true },
    );
  });

  it('does not navigate when not on map view', () => {
    mockUseLocation.mockReturnValue({
      pathname: ROUTE_PATHS.SEARCH,
      search: '?view=list',
    });

    const { result } = renderHook(() => useReplaceHistoryWithMapFocus('456'));

    result.current();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when not on search path', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/resource/789',
      search: '?view=map',
    });

    const { result } = renderHook(() => useReplaceHistoryWithMapFocus('789'));

    result.current();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

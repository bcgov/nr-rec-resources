import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';
import { SearchMapFocusModes } from '@/components/search-map/constants';

/**
 * Returns a click handler that, when invoked from the search map view,
 * replaces the current history entry with a focused map URL so that
 * browser back returns to the map focused on the given resource.
 */
export function useReplaceHistoryWithMapFocus(recResourceId?: string) {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMapUrl = useMemo(() => {
    if (!recResourceId) return null;
    return {
      pathname: ROUTE_PATHS.SEARCH,
      search: {
        view: 'map',
        focus: `${SearchMapFocusModes.REC_RESOURCE_ID}:${recResourceId}`,
      },
    } as const;
  }, [recResourceId]);

  const replaceHistoryWithFocusedMap = useCallback(() => {
    if (!mainMapUrl) return;
    const isOnSearchPath = location.pathname === ROUTE_PATHS.SEARCH;
    const params = new URLSearchParams(location.search);
    const isMapView = params.get('view') === 'map';
    if (isOnSearchPath && isMapView) {
      navigate({
        to: mainMapUrl.pathname,
        search: mainMapUrl.search,
        replace: true,
      });
    }
  }, [location.pathname, location.search, navigate, mainMapUrl]);

  return replaceHistoryWithFocusedMap;
}

export default useReplaceHistoryWithMapFocus;
